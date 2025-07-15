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
      firstname, 
      lastname, 
      email, 
      phonenumber, 
      password,
      companyId,
      companySlug,
      role = 'employee' // Default role for employees
    } = body;

    // Validate required fields
    if (!firstname || !lastname || !password || (!email && !phonenumber)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Validate company identification (either companyId or companySlug must be provided)
    if (!companyId && !companySlug) {
      return NextResponse.json(
        { success: false, error: 'Company identification (companyId or companySlug) is required.' },
        { status: 400 }
      );
    }

    // Find the company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { id: companyId || undefined },
          { slug: companySlug || undefined },
        ],
        isActive: true, // Only allow registration for active companies
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found or inactive.' },
        { status: 404 }
      );
    }

    // Check if user already exists (globally)
    const existingUser = await prisma.beeusers.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phonenumber: phonenumber || undefined },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with that email or phone.' },
        { status: 400 }
      );
    }

    // Check if company has reached max users limit
    const currentUserCount = await prisma.beeusers.count({
      where: { companyId: company.id },
    });

    if (currentUserCount >= company.maxUsers) {
      return NextResponse.json(
        { success: false, error: 'Company has reached maximum user limit.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const confirmationToken = randomUUID();

    // Create employee user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create employee user
      const newUser = await tx.beeusers.create({
        data: {
          firstname,
          lastname,
          email,
          phonenumber,
          password: hashedPassword,
          confirmationToken,
          isConfirmed: false,
          companyId: company.id,
          role: role,
          isProfileComplete: false, // Employee needs to complete profile
        },
      });

      // 2. Create initial token stats for employee
      await tx.tokenStats.create({
        data: {
          userId: newUser.id,
          totalTokens: 0, // Employees start with 0 tokens
          remainingTokens: 0,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
        },
      });

      // 3. Send welcome email
      await sendWelcomeEmail(company, newUser, confirmationToken);

      return { user: newUser, company };
    });

    console.log('Employee registered:', result.user.id);
    console.log('Associated with company:', result.company.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Employee registered successfully. Please check your email to confirm.',
        userId: result.user.id,
        companyId: result.company.id,
        companySlug: result.company.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during employee registration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error during registration.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function sendWelcomeEmail(company: any, user: any, confirmationToken: string) {
  if (!user.email) return; // Skip if no email provided

  const confirmationLink = `${process.env.BASE_URL}/confirm?token=${confirmationToken}`;
  const companyDashboardLink = `${process.env.BASE_URL}/dashboard/company/${company.slug}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to ${company.name} - Honey Certify`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Welcome to Honey Certify!</h2>
        <p>Hello ${user.firstname} ${user.lastname},</p>
        <p>You have been successfully registered as an employee of <strong>${company.name}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937;">Your Account Details:</h3>
          <ul style="color: #4b5563;">
            <li><strong>Name:</strong> ${user.firstname} ${user.lastname}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Company:</strong> ${company.name}</li>
            <li><strong>Role:</strong> ${user.role}</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e;">Next Steps:</h3>
          <ol style="color: #92400e;">
            <li>Confirm your email address by clicking the button below</li>
            <li>Complete your profile setup</li>
            <li>Access your company dashboard</li>
            <li>Start working with honey certifications</li>
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
            As a ${user.role} at ${company.name}, you can:
          </p>
          <ul style="color: #6b7280; font-size: 14px;">
            <li>Access company honey batches</li>
            <li>Work with certifications and reports</li>
            <li>Collaborate with your team</li>
            <li>View company statistics</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          If you have any questions, please contact your company administrator or our support team.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}