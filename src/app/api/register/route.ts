// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration data:', body);
    
    const { 
      firstname, 
      lastname, 
      email, 
      phonenumber, 
      password,
      companyId,
      companySlug,
      role = 'employee'
    } = body;

    // Validate required fields
    if (!firstname?.trim() || !lastname?.trim() || !password) {
      console.log('Missing required fields:', { firstname: !!firstname?.trim(), lastname: !!lastname?.trim(), password: !!password });
      return NextResponse.json(
        { success: false, error: 'First name, last name, and password are required.' },
        { status: 400 }
      );
    }

    // Validate contact information (either email or phone must be provided)
    if (!email?.trim() && !phonenumber?.trim()) {
      console.log('Missing contact info:', { email: !!email?.trim(), phonenumber: !!phonenumber?.trim() });
      return NextResponse.json(
        { success: false, error: 'Either email or phone number is required.' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate phone number format if provided
    if (phonenumber && phonenumber.length < 10) {
      console.log('Invalid phone number format:', phonenumber);
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Validate company identification
    if (!companyId?.trim() && !companySlug?.trim()) {
      console.log('Missing company identification');
      return NextResponse.json(
        { success: false, error: 'Company identification (Company ID or Company Slug) is required.' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['employee', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { success: false, error: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    // Find the company
    console.log('Looking for company with:', { companyId: companyId?.trim(), companySlug: companySlug?.trim() });
    
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { id: companyId?.trim() || undefined },
          { slug: companySlug?.trim() || undefined },
        ],
        isActive: true,
      },
    });

    console.log('Found company:', company ? { id: company.id, name: company.name, slug: company.slug } : null);

    if (!company) {
      console.log('Company not found or inactive');
      return NextResponse.json(
        { success: false, error: 'Company not found or inactive. Please check your Company ID or Company Slug.' },
        { status: 404 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user with:', { email: email?.trim(), phonenumber: phonenumber?.trim() });
    
    const existingUser = await prisma.beeusers.findFirst({
      where: {
        OR: [
          { email: email?.trim() || undefined },
          { phonenumber: phonenumber?.trim() || undefined },
        ],
      },
    });

    console.log('Existing user check result:', existingUser ? { id: existingUser.id, email: existingUser.email, phonenumber: existingUser.phonenumber } : null);

    if (existingUser) {
      const conflictField = existingUser.email === email?.trim() ? 'email' : 'phone number';
      console.log('User already exists with conflicting field:', conflictField);
      return NextResponse.json(
        { success: false, error: `An account already exists with that ${conflictField}.` },
        { status: 400 }
      );
    }

    // Check if company has reached max users limit
    console.log('Checking user count limit for company:', company.id);
    
    const currentUserCount = await prisma.beeusers.count({
      where: {
        // Add company association check if your schema has it
        // companyId: company.id  // Uncomment if you have this field
      }
    });

    console.log('Current user count:', currentUserCount, 'Max users:', company.maxUsers);

    if (currentUserCount >= company.maxUsers) {
      console.log('Company has reached maximum user limit');
      return NextResponse.json(
        { success: false, error: `${company.name} has reached its maximum user limit of ${company.maxUsers}.` },
        { status: 400 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    const confirmationToken = randomUUID();
    const requiresConfirmation = true;

    console.log('Starting user creation transaction...');

    // Create employee user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create employee user
      console.log('Creating new user...');
      const newUser = await tx.beeusers.create({
        data: {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email?.trim() || null,
          phonenumber: phonenumber?.trim() || null,
          password: hashedPassword,
          confirmationToken,
          isConfirmed: !requiresConfirmation,
          role: role,
          isProfileComplete: false,
          // Add company association if your schema has it
          // companyId: company.id  // Uncomment if you have this field
        },
      });

      console.log('User created successfully:', newUser.id);

      // Create initial token stats for employee
      console.log('Creating token stats...');
      await tx.tokenStats.create({
        data: {
          userId: newUser.id,
          totalTokens: 0,
          remainingTokens: 0,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
        },
      });

      console.log('Token stats created successfully');

      // Send welcome email if email is provided
      if (email?.trim()) {
        console.log('Sending welcome email...');
        await sendWelcomeEmail(company, newUser, confirmationToken, requiresConfirmation);
        console.log('Welcome email sent successfully');
      }

      return { user: newUser, company, requiresConfirmation };
    });

    console.log('Transaction completed successfully');
    console.log('Employee registered:', result.user.id);
    console.log('Associated with company:', result.company.id);
    console.log('Requires confirmation:', result.requiresConfirmation);

    return NextResponse.json(
      {
        success: true,
        message: result.requiresConfirmation 
          ? `Account created successfully! Please check your email to confirm your account.`
          : `Account created successfully! Welcome to ${company.name}.`,
        userId: result.user.id,
        companyId: result.company.id,
        companyName: result.company.name,
        companySlug: result.company.slug,
        requiresConfirmation: result.requiresConfirmation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during employee registration:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function sendWelcomeEmail(company: any, user: any, confirmationToken: string, requiresConfirmation: boolean) {
  if (!user.email) return;

  const confirmationLink = `${process.env.BASE_URL}/confirm?token=${confirmationToken}`;
  const companyDashboardLink = `${process.env.BASE_URL}/dashboard/company/${company.slug}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to ${company.name} - Honey Certify`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fffbeb; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🍯 Welcome to Honey Certify!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Blockchain-powered honey authentication</p>
          </div>
        </div>

        <div style="background-color: white; padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; margin-bottom: 20px;">
          <h2 style="color: #92400e; margin-top: 0;">Hello ${user.firstname} ${user.lastname}!</h2>
          <p style="color: #451a03; font-size: 16px; line-height: 1.6;">
            You have been successfully registered as a <strong>${user.role}</strong> at <strong>${company.name}</strong>. 
            Welcome to the future of honey certification!
          </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0;">📋 Your Account Details:</h3>
          <ul style="color: #451a03; font-size: 14px; line-height: 1.8;">
            <li><strong>Name:</strong> ${user.firstname} ${user.lastname}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Company:</strong> ${company.name}</li>
            <li><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</li>
          </ul>
        </div>

        ${requiresConfirmation ? `
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #dc2626; margin-top: 0;">⚠️ Email Confirmation Required</h3>
          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6;">
            Please confirm your email address by clicking the button below to activate your account.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${confirmationLink}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ✅ Confirm Email Address
            </a>
          </div>
        </div>
        ` : ''}

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #047857; margin-top: 0;">🚀 Next Steps:</h3>
          <ol style="color: #064e3b; font-size: 14px; line-height: 1.8;">
            ${requiresConfirmation ? '<li>Confirm your email address using the button above</li>' : ''}
            <li>Complete your profile setup</li>
            <li>Access your company dashboard</li>
            <li>Start working with honey certifications</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${companyDashboardLink}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🏢 Go to Company Dashboard
          </a>
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin-top: 0;">👤 As a ${user.role} at ${company.name}, you can:</h3>
          <ul style="color: #0c4a6e; font-size: 14px; line-height: 1.8;">
            <li>🍯 Access company honey batches and products</li>
            <li>📋 Work with certifications and quality reports</li>
            <li>🤝 Collaborate with your team members</li>
            <li>📊 View company statistics and analytics</li>
            ${user.role === 'admin' ? '<li>⚙️ Manage company settings and users</li>' : ''}
            ${user.role === 'manager' ? '<li>👥 Manage team members and assignments</li>' : ''}
          </ul>
        </div>

        <div style="border-top: 2px solid #fbbf24; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            🍯 <strong>Honey Certify</strong> - Securing authenticity with blockchain technology
          </p>
          <p style="color: #a16207; font-size: 12px; margin: 10px 0 0 0;">
            If you have any questions, please contact your company administrator or our support team.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}