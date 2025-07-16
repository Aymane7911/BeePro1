// app/api/register-company/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';

const prisma = new PrismaClient();

// Enhanced logging utility
const log = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  success: (message: string, data?: any) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Database creation utility functions
async function createCompanyDatabase(companySlug: string) {
  log.info('Starting company database creation', { companySlug });
  
  const masterDbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to master database
  };

  log.debug('Master database config', { 
    host: masterDbConfig.host, 
    port: masterDbConfig.port, 
    user: masterDbConfig.user,
    database: masterDbConfig.database 
  });

  const client = new Client(masterDbConfig);
  const companyDbName = `honey_certify_${companySlug}`;

  try {
    log.info('Connecting to master database');
    await client.connect();
    log.success('Connected to master database successfully');
    
    // Create new database for the company
    log.info('Creating company database', { companyDbName });
    await client.query(`CREATE DATABASE "${companyDbName}"`);
    log.success('Database created successfully', { companyDbName });
    
    await client.end();
    log.info('Master database connection closed');
    
    // Now create the schema in the new database
    log.info('Starting schema creation for company database');
    await createCompanySchema(companyDbName);
    
    return companyDbName;
  } catch (error) {
    log.error('Error creating company database', error);
    try {
      await client.end();
      log.info('Master database connection closed after error');
    } catch (closeError) {
      log.error('Error closing master database connection', closeError);
    }
    throw error;
  }
}

async function createCompanySchema(databaseName: string) {
  log.info('Starting schema creation', { databaseName });
  
  const companyDbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: databaseName,
  };

  log.debug('Company database config', { 
    host: companyDbConfig.host, 
    port: companyDbConfig.port, 
    user: companyDbConfig.user,
    database: companyDbConfig.database 
  });

  const client = new Client(companyDbConfig);

  try {
    log.info('Connecting to company database for schema creation');
    await client.connect();
    log.success('Connected to company database successfully');
    
    // Create the schema for the company database
    log.info('Executing schema SQL statements');
    const schemaSQL = `
      -- Create tables for company database
      CREATE TABLE IF NOT EXISTS "beeusers" (
        "id" SERIAL PRIMARY KEY,
        "firstname" VARCHAR(255) NOT NULL,
        "lastname" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "phonenumber" VARCHAR(255),
        "password" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "confirmation_token" VARCHAR(255),
        "is_confirmed" BOOLEAN DEFAULT FALSE,
        "passport_id" VARCHAR(255),
        "passport_file" VARCHAR(255),
        "phone_confirmed" VARCHAR(255),
        "isProfileComplete" BOOLEAN DEFAULT FALSE,
        "google_id" VARCHAR(255),
        "is_premium" BOOLEAN DEFAULT FALSE,
        "premium_expires_at" TIMESTAMP,
        "premium_started_at" TIMESTAMP,
        "role" VARCHAR(50) DEFAULT 'employee'
      );

      CREATE TABLE IF NOT EXISTS "batches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "batchNumber" VARCHAR(255) NOT NULL UNIQUE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "bothCertifications" DECIMAL(10,2) DEFAULT 0,
        "bothCertificationsPercent" INTEGER DEFAULT 0,
        "certificationDate" VARCHAR(255),
        "completedChecks" INTEGER DEFAULT 0,
        "containerType" VARCHAR(255) DEFAULT 'Glass',
        "expiryDate" VARCHAR(255),
        "jarsUsed" INTEGER DEFAULT 0,
        "labelType" VARCHAR(255) DEFAULT 'Standard',
        "originOnly" DECIMAL(10,2) DEFAULT 0,
        "originOnlyPercent" INTEGER DEFAULT 0,
        "qualityOnly" DECIMAL(10,2) DEFAULT 0,
        "qualityOnlyPercent" INTEGER DEFAULT 0,
        "status" VARCHAR(255) DEFAULT 'Pending',
        "totalChecks" INTEGER DEFAULT 4,
        "uncertified" DECIMAL(10,2) DEFAULT 0,
        "uncertifiedPercent" INTEGER DEFAULT 0,
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "userId" INTEGER NOT NULL REFERENCES "beeusers"("id"),
        "weightKg" DECIMAL(10,2) DEFAULT 0,
        "batchName" VARCHAR(255) NOT NULL,
        "lab_report_path" VARCHAR(500),
        "production_report_path" VARCHAR(500),
        "jarCertifications" JSONB,
        "honeyCertified" DECIMAL(10,2),
        "honeyRemaining" DECIMAL(10,2),
        "totalHoneyCollected" DECIMAL(10,2)
      );

      CREATE TABLE IF NOT EXISTS "TokenStats" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" INTEGER NOT NULL UNIQUE REFERENCES "beeusers"("id"),
        "totalTokens" INTEGER DEFAULT 0,
        "remainingTokens" INTEGER DEFAULT 0,
        "originOnly" INTEGER DEFAULT 0,
        "qualityOnly" INTEGER DEFAULT 0,
        "bothCertifications" INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "apiaries" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "number" VARCHAR(255) NOT NULL,
        "hiveCount" INTEGER NOT NULL,
        "latitude" DECIMAL(10,8) NOT NULL,
        "longitude" DECIMAL(11,8) NOT NULL,
        "batchId" UUID REFERENCES "batches"("id"),
        "kilosCollected" DECIMAL(10,2) DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "userId" INTEGER NOT NULL REFERENCES "beeusers"("id")
      );

      CREATE TABLE IF NOT EXISTS "certifications" (
        "id" VARCHAR(255) PRIMARY KEY,
        "verification_code" VARCHAR(255) NOT NULL UNIQUE,
        "batch_ids" VARCHAR(255) NOT NULL,
        "certification_date" DATE NOT NULL,
        "total_certified" DECIMAL(10,2) NOT NULL,
        "certification_type" VARCHAR(255) NOT NULL,
        "expiry_date" DATE NOT NULL,
        "total_jars" INTEGER NOT NULL,
        "company_name" VARCHAR(255),
        "beekeeper_name" VARCHAR(255),
        "location" VARCHAR(255),
        "user_id" INTEGER NOT NULL REFERENCES "beeusers"("id"),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" VARCHAR(255) PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "beeusers"("id") ON DELETE CASCADE,
        "type" VARCHAR(255) NOT NULL,
        "provider" VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" VARCHAR(255),
        "scope" VARCHAR(255),
        "id_token" TEXT,
        "session_state" VARCHAR(255),
        UNIQUE("provider", "providerAccountId")
      );

      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" VARCHAR(255) PRIMARY KEY,
        "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
        "userId" INTEGER NOT NULL REFERENCES "beeusers"("id") ON DELETE CASCADE,
        "expires" TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" VARCHAR(255) NOT NULL,
        "token" VARCHAR(255) NOT NULL UNIQUE,
        "expires" TIMESTAMP NOT NULL,
        UNIQUE("identifier", "token")
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS "idx_certifications_verification_code" ON "certifications"("verification_code");
      CREATE INDEX IF NOT EXISTS "idx_certifications_user_id" ON "certifications"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_certifications_expiry_date" ON "certifications"("expiry_date");
      CREATE INDEX IF NOT EXISTS "idx_batches_user_id" ON "batches"("userId");
      CREATE INDEX IF NOT EXISTS "idx_apiaries_user_id" ON "apiaries"("userId");
      CREATE INDEX IF NOT EXISTS "idx_apiaries_batch_id" ON "apiaries"("batchId");

      -- Create trigger for updating updatedAt timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON "batches" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON "certifications" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await client.query(schemaSQL);
    log.success('Schema created successfully', { databaseName });
    
    await client.end();
    log.info('Company database connection closed after schema creation');
  } catch (error) {
    log.error('Error creating company schema', error);
    try {
      await client.end();
      log.info('Company database connection closed after error');
    } catch (closeError) {
      log.error('Error closing company database connection', closeError);
    }
    throw error;
  }
}

// Function to get company-specific Prisma client
function getCompanyPrismaClient(databaseName: string) {
  log.info('Creating company Prisma client', { databaseName });
  
  const databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${databaseName}`;
  
  log.debug('Database URL constructed', { 
    databaseUrl: databaseUrl.replace(process.env.DB_PASSWORD || '', '***') 
  });
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  log.info('Company registration request started', { requestId });
  
  try {
    log.info('Parsing request body', { requestId });
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

    log.info('Request data received', { 
      requestId,
      companyName,
      companyEmail,
      domain,
      adminEmail,
      hasPassword: !!adminPassword
    });

    // Validate required fields
    log.info('Validating required fields', { requestId });
    if (!companyName || !companyEmail || !adminFirstname || !adminLastname || !adminEmail || !adminPassword) {
      log.warn('Missing required fields', { 
        requestId,
        missing: {
          companyName: !companyName,
          companyEmail: !companyEmail,
          adminFirstname: !adminFirstname,
          adminLastname: !adminLastname,
          adminEmail: !adminEmail,
          adminPassword: !adminPassword
        }
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Check if company already exists in main database
    log.info('Checking for existing company', { requestId });
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
      log.warn('Company already exists', { 
        requestId,
        existingCompany: {
          id: existingCompany.id,
          name: existingCompany.name,
          email: existingCompany.email,
          domain: existingCompany.domain
        }
      });
      return NextResponse.json(
        { success: false, error: 'Company already exists with that name, email, or domain.' },
        { status: 400 }
      );
    }

    // Check if admin user email already exists (globally in main database)
    log.info('Checking for existing admin user', { requestId });
    const existingUser = await prisma.beeusers.findFirst({
      where: { email: adminEmail },
    });

    if (existingUser) {
      log.warn('Admin user already exists', { 
        requestId,
        existingUser: {
          id: existingUser.id,
          email: existingUser.email
        }
      });
      return NextResponse.json(
        { success: false, error: 'Admin user already exists with that email.' },
        { status: 400 }
      );
    }

    // Create company slug
    log.info('Creating company slug', { requestId });
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    log.info('Company slug generated', { requestId, slug });
    
    // Hash admin password
    log.info('Hashing admin password', { requestId });
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const confirmationToken = randomUUID();
    log.success('Password hashed and confirmation token generated', { requestId });

    // Create company and admin user in a transaction
    log.info('Starting database transaction', { requestId });
    const result = await prisma.$transaction(async (tx) => {
      log.info('Transaction started - creating company record', { requestId });
      
      // 1. Create company record in main database
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

      log.success('Company record created', { 
        requestId,
        companyId: newCompany.id,
        companySlug: newCompany.slug
      });

      // 2. Create company-specific database
      log.info('Creating company-specific database', { requestId });
      const companyDbName = await createCompanyDatabase(slug);
      log.success('Company database created', { requestId, companyDbName });
      
      // 3. Update company record with database name
      log.info('Updating company record with database name', { requestId });
      await tx.company.update({
        where: { id: newCompany.id },
        data: { 
          databaseName: companyDbName 
        }
      });
      log.success('Company record updated with database name', { requestId });

      // 4. Create admin user in the company's database
      log.info('Creating admin user in company database', { requestId });
      const companyPrisma = getCompanyPrismaClient(companyDbName);
      
      try {
        const newAdminUser = await companyPrisma.beeusers.create({
          data: {
            firstname: adminFirstname,
            lastname: adminLastname,
            email: adminEmail,
            phonenumber: adminPhone,
            password: hashedPassword,
            confirmationToken: confirmationToken,
            isConfirmed: false,
            role: 'admin',
            isProfileComplete: true,
          },
        });

        log.success('Admin user created in company database', { 
          requestId,
          adminUserId: newAdminUser.id,
          adminEmail: newAdminUser.email
        });

        // 5. Create initial token stats for admin in company database
        log.info('Creating initial token stats for admin', { requestId });
        await companyPrisma.tokenStats.create({
          data: {
            userId: newAdminUser.id,
            totalTokens: 1000,
            remainingTokens: 1000,
            originOnly: 0,
            qualityOnly: 0,
            bothCertifications: 0,
          },
        });

        log.success('Token stats created for admin user', { requestId });

        // 6. Send welcome email
        log.info('Sending welcome email', { requestId });
        await sendWelcomeEmail(newCompany, newAdminUser, confirmationToken);
        log.success('Welcome email sent', { requestId });

        return { 
          company: newCompany, 
          adminUser: newAdminUser, 
          databaseName: companyDbName 
        };
      } finally {
        log.info('Disconnecting company Prisma client', { requestId });
        await companyPrisma.$disconnect();
      }
    });

    log.success('Transaction completed successfully', { 
      requestId,
      companyId: result.company.id,
      adminUserId: result.adminUser.id,
      databaseName: result.databaseName
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Company registered successfully. Please check your email to confirm.',
        companyId: result.company.id,
        adminUserId: result.adminUser.id,
        companySlug: result.company.slug,
        databaseName: result.databaseName,
      },
      { status: 201 }
    );
  } catch (error) {
    log.error('Error during company registration', { 
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { success: false, error: 'Internal Server Error during company registration.' },
      { status: 500 }
    );
  } finally {
    log.info('Disconnecting main Prisma client', { requestId });
    await prisma.$disconnect();
    log.info('Company registration request completed', { requestId });
  }
}

async function sendWelcomeEmail(company: any, adminUser: any, confirmationToken: string) {
  log.info('Preparing welcome email', { 
    companyName: company.name,
    adminEmail: adminUser.email
  });
  
  const confirmationLink = `${process.env.BASE_URL}/confirm?token=${confirmationToken}`;
  const companyDashboardLink = `${process.env.BASE_URL}/dashboard/company/${company.slug}`;
  
  log.debug('Email links generated', { 
    confirmationLink,
    companyDashboardLink
  });
  
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
          Your company now has its own dedicated database for enhanced security and performance.
        </p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    log.success('Welcome email sent successfully', { 
      to: adminUser.email,
      subject: mailOptions.subject
    });
  } catch (error) {
    log.error('Failed to send welcome email', { 
      to: adminUser.email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}