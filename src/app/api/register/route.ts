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
      return NextResponse.json({ success: false, error: 'First name, last name, and password are required.' }, { status: 400 });
    }

    // Validate contact information
    if (!email?.trim() && !phonenumber?.trim()) {
      return NextResponse.json({ success: false, error: 'Either email or phone number is required.' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (phonenumber && phonenumber.length < 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (!companyId?.trim() && !companySlug?.trim()) {
      return NextResponse.json({ success: false, error: 'Database identification (ID or slug) is required.' }, { status: 400 });
    }

    const validRoles = ['employee', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role specified.' }, { status: 400 });
    }

    // Lookup the database instance
    const dbInstance = await prisma.database.findFirst({
      where: {
        OR: [
          { id: companyId?.trim() || undefined },
          // If you have slug field on Database
          { slug: companySlug?.trim() || undefined },
        ],
        isActive: true,
      },
    });

    if (!dbInstance) {
      return NextResponse.json({ success: false, error: 'Database not found or inactive.' }, { status: 404 });
    }

    // Check for existing user
    const existingUser = await prisma.beeusers.findFirst({
      where: {
        OR: [
          { email: email?.trim() || undefined },
          { phonenumber: phonenumber?.trim() || undefined },
        ],
        databaseId: dbInstance.id,
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === email?.trim() ? 'email' : 'phone number';
      return NextResponse.json({ success: false, error: `An account already exists with that ${conflictField}.` }, { status: 400 });
    }

    // Check user count limit
    const currentUserCount = await prisma.beeusers.count({
      where: { databaseId: dbInstance.id }
    });

    if (currentUserCount >= (dbInstance.maxUsers || 0)) {
      return NextResponse.json({ success: false, error: `${dbInstance.displayName} has reached its maximum user limit of ${dbInstance.maxUsers}.` }, { status: 400 });
    }

    // Hash password and generate confirmation token
    const hashedPassword = await bcrypt.hash(password, 12);
    const confirmationToken = randomUUID();
    const requiresConfirmation = true;

    // Create user + stats in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.beeusers.create({
        data: {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email?.trim() || null,
          phonenumber: phonenumber?.trim() || null,
          password: hashedPassword,
          confirmationToken,
          isConfirmed: !requiresConfirmation,
          role,
          isProfileComplete: false,
          databaseId: dbInstance.id,
        },
      });

      await tx.tokenStats.create({
        data: {
          userId: newUser.id,
          totalTokens: 0,
          remainingTokens: 0,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
          databaseId: dbInstance.id,
        },
      });

      if (email?.trim()) {
        await sendWelcomeEmail(dbInstance, newUser, confirmationToken, requiresConfirmation);
      }

      return { newUser, dbInstance, requiresConfirmation };
    });

    return NextResponse.json({
      success: true,
      message: result.requiresConfirmation
        ? 'Account created! Please check your email to confirm.'
        : `Account created successfully! Welcome to ${dbInstance.displayName}.`,
      userId: result.newUser.id,
      databaseId: result.dbInstance.id,
      displayName: result.dbInstance.displayName,
      slug: result.dbInstance.slug,
      requiresConfirmation: result.requiresConfirmation,
    }, { status: 201 });

  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function sendWelcomeEmail(dbInstance: any, user: any, confirmationToken: string, requiresConfirmation: boolean) {
  if (!user.email) return;

  const confirmationLink = `${process.env.BASE_URL}/confirm?token=${confirmationToken}`;
  const dashboardLink    = `${process.env.BASE_URL}/dashboard/db/${dbInstance.slug}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to ${dbInstance.displayName}`,
    html: `
      <h1>Welcome, ${user.firstname}!</h1>
      <p>You have been registered as a ${user.role}.</p>
      ${requiresConfirmation ? `<p>Please confirm: <a href="${confirmationLink}">Confirm Email</a></p>` : ''}
      <p><a href="${dashboardLink}">Go to Dashboard</a></p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
