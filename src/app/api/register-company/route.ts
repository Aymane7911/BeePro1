// app/api/register-company/route.ts
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
    const { 
      // Company details
      companyName, 
      companyEmail, 
      companyPhone, 
      companyAddress, 
      domain,
      // Admin user details
      adminFirstname, 
      adminLastname, 
      adminEmail, 
      adminPhone, 
      adminPassword 
    } = body;

    // Validate required fields
    if (!companyName || !companyEmail || !adminFirstname || !adminLastname || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { email: companyEmail },
          { name: companyName },
          { domain: domain || undefined },
        ],
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: 'Company already exists with that name, email, or domain.' },
        { status: 400 }
      );
    }

    // Check if admin user email already exists (globally)
    const existingUser = await prisma.beeusers.findFirst({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user already exists with that email.' },
        { status: 400 }
      );
    }

    // Create company slug
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const confirmationToken = randomUUID();

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create company
      const newCompany = await tx.company.create({
        data: {
          name: companyName,
          slug,
          email: companyEmail,
          phone: companyPhone,
          address: companyAddress,
          domain,
          subscriptionPlan: 'basic',
          isActive: true,
          maxUsers: 10,
          maxBatches: 100,
        },
      });

      // 2. Create admin user
      const newAdminUser = await tx.beeusers.create({
        data: {
          firstname: adminFirstname,
          lastname: adminLastname,
          email: adminEmail,
          phonenumber: adminPhone,
          password: hashedPassword,
          confirmationToken,
          isConfirmed: false,
          companyId: newCompany.id,
          role: 'admin', // Admin role for company owner
          isProfileComplete: true, // Admin profile is complete
        },
      });

      // 3. Create initial token stats for admin
      await tx.tokenStats.create({
        data: {
          userId: newAdminUser.id,
          totalTokens: 1000, // Initial tokens for new company
          remainingTokens: 1000,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
        },
      });

      // 4. Create default departments for the company
      //await tx.departments?.create({
      //  data: {
      //    name: 'Administration',
        //  description: 'Administrative department',
         // companyId: newCompany.id,
       // },
      //});

      // 5. Send welcome email with setup instructions
      await sendWelcomeEmail(newCompany, newAdminUser, confirmationToken);

      return { company: newCompany, adminUser: newAdminUser };
    });

    console.log('Company registered:', result.company.id);
    console.log('Admin user created:', result.adminUser.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Company registered successfully. Please check your email to confirm.',
        companyId: result.company.id,
        adminUserId: result.adminUser.id,
        companySlug: result.company.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during company registration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error during company registration.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function sendWelcomeEmail(company: any, adminUser: any, confirmationToken: string) {
  const confirmationLink = `${process.env.BASE_URL}/confirm?token=${confirmationToken}`;
  const companyDashboardLink = `${process.env.BASE_URL}/dashboard/company/${company.slug}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminUser.email,
    subject: `Welcome to Honey Certify - ${company.name} Setup Complete`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Welcome to Honey Certify!</h2>
        <p>Congratulations! Your company "<strong>${company.name}</strong>" has been successfully registered.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937;">Company Details:</h3>
          <ul style="color: #4b5563;">
            <li><strong>Company Name:</strong> ${company.name}</li>
            <li><strong>Company Email:</strong> ${company.email}</li>
            <li><strong>Company Slug:</strong> ${company.slug}</li>
            <li><strong>Subscription Plan:</strong> ${company.subscriptionPlan}</li>
            <li><strong>Max Users:</strong> ${company.maxUsers}</li>
            <li><strong>Max Batches:</strong> ${company.maxBatches}</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e;">Next Steps:</h3>
          <ol style="color: #92400e;">
            <li>Confirm your email address by clicking the button below</li>
            <li>Access your company dashboard</li>
            <li>Invite team members to join your company</li>
            <li>Start managing your honey certifications</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationLink}" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Email Address</a>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${companyDashboardLink}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            As the company administrator, you can now:
          </p>
          <ul style="color: #6b7280; font-size: 14px;">
            <li>Invite employees to join your company</li>
            <li>Manage user roles and permissions</li>
            <li>Create and manage honey batches</li>
            <li>Handle certifications and reports</li>
            <li>Monitor company statistics</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}