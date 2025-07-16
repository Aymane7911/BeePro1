// utils/database.ts
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';

// Cache for company Prisma clients to avoid creating multiple connections
const companyPrismaClients = new Map<string, PrismaClient>();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function getDatabaseConfig(databaseName?: string): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: databaseName || process.env.DB_NAME || 'honey_certify',
  };
}

export function getCompanyPrismaClient(companySlug: string): PrismaClient {
  if (companyPrismaClients.has(companySlug)) {
    return companyPrismaClients.get(companySlug)!;
  }

  const databaseName = `honey_certify_${companySlug}`;
  const config = getDatabaseConfig(databaseName);
  const databaseUrl = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  companyPrismaClients.set(companySlug, prismaClient);
  return prismaClient;
}

export async function createCompanyDatabase(companySlug: string): Promise<string> {
  const masterConfig = getDatabaseConfig('postgres');
  const client = new Client(masterConfig);
  const companyDbName = `honey_certify_${companySlug}`;

  try {
    await client.connect();
    // Create new database for the company
    await client.query(`CREATE DATABASE "${companyDbName}"`);
    console.log(`Database ${companyDbName} created successfully`);
    return companyDbName;
  } catch (error) {
    console.error('Error creating company database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function createCompanySchema(databaseName: string): Promise<void> {
  const config = getDatabaseConfig(databaseName);
  const client = new Client(config);

  try {
    await client.connect();

    // Install required extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Create the schema for the company database
    const schemaSQL = `
      -- Create beeusers table
      CREATE TABLE IF NOT EXISTS "beeusers" (
        "id" SERIAL PRIMARY KEY,
        "firstname" VARCHAR(255) NOT NULL,
        "lastname" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "role" VARCHAR(50) DEFAULT 'user',
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create apiaries table
      CREATE TABLE IF NOT EXISTS "apiaries" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "location" VARCHAR(255) NOT NULL,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "description" TEXT,
        "ownerId" INTEGER REFERENCES "beeusers"("id") ON DELETE CASCADE,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create hives table
      CREATE TABLE IF NOT EXISTS "hives" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "hiveType" VARCHAR(100) NOT NULL,
        "apiaryId" INTEGER REFERENCES "apiaries"("id") ON DELETE CASCADE,
        "queenId" VARCHAR(255),
        "status" VARCHAR(50) DEFAULT 'active',
        "installDate" DATE,
        "lastInspection" DATE,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create inspections table
      CREATE TABLE IF NOT EXISTS "inspections" (
        "id" SERIAL PRIMARY KEY,
        "hiveId" INTEGER REFERENCES "hives"("id") ON DELETE CASCADE,
        "inspectorId" INTEGER REFERENCES "beeusers"("id") ON DELETE SET NULL,
        "inspectionDate" DATE NOT NULL,
        "weather" VARCHAR(100),
        "temperature" DECIMAL(5, 2),
        "humidity" DECIMAL(5, 2),
        "queenPresent" BOOLEAN,
        "queenMarked" BOOLEAN,
        "eggsPresent" BOOLEAN,
        "larvaePresent" BOOLEAN,
        "pupaePresent" BOOLEAN,
        "honeyStores" VARCHAR(50),
        "pollenStores" VARCHAR(50),
        "broodPattern" VARCHAR(100),
        "temperament" VARCHAR(100),
        "diseasesSeen" TEXT,
        "treatmentsApplied" TEXT,
        "feedingGiven" TEXT,
        "equipmentChanges" TEXT,
        "notes" TEXT,
        "overallRating" INTEGER CHECK ("overallRating" >= 1 AND "overallRating" <= 5),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create honey_harvests table
      CREATE TABLE IF NOT EXISTS "honey_harvests" (
        "id" SERIAL PRIMARY KEY,
        "hiveId" INTEGER REFERENCES "hives"("id") ON DELETE CASCADE,
        "harvesterId" INTEGER REFERENCES "beeusers"("id") ON DELETE SET NULL,
        "harvestDate" DATE NOT NULL,
        "quantity" DECIMAL(10, 3) NOT NULL,
        "unit" VARCHAR(20) DEFAULT 'kg',
        "moistureContent" DECIMAL(5, 2),
        "qualityGrade" VARCHAR(50),
        "flowerSource" VARCHAR(255),
        "processingMethod" VARCHAR(100),
        "storageLocation" VARCHAR(255),
        "batchNumber" VARCHAR(100),
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create treatments table
      CREATE TABLE IF NOT EXISTS "treatments" (
        "id" SERIAL PRIMARY KEY,
        "hiveId" INTEGER REFERENCES "hives"("id") ON DELETE CASCADE,
        "treatmentType" VARCHAR(100) NOT NULL,
        "product" VARCHAR(255) NOT NULL,
        "dosage" VARCHAR(100),
        "applicationMethod" VARCHAR(100),
        "applicationDate" DATE NOT NULL,
        "appliedBy" INTEGER REFERENCES "beeusers"("id") ON DELETE SET NULL,
        "reason" TEXT,
        "effectivenessRating" INTEGER CHECK ("effectivenessRating" >= 1 AND "effectivenessRating" <= 5),
        "sideEffects" TEXT,
        "withdrawalPeriod" INTEGER,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create feeding_records table
      CREATE TABLE IF NOT EXISTS "feeding_records" (
        "id" SERIAL PRIMARY KEY,
        "hiveId" INTEGER REFERENCES "hives"("id") ON DELETE CASCADE,
        "feedType" VARCHAR(100) NOT NULL,
        "quantity" DECIMAL(10, 3) NOT NULL,
        "unit" VARCHAR(20) DEFAULT 'kg',
        "feedingDate" DATE NOT NULL,
        "reason" VARCHAR(255),
        "fedBy" INTEGER REFERENCES "beeusers"("id") ON DELETE SET NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create certificates table
      CREATE TABLE IF NOT EXISTS "certificates" (
        "id" SERIAL PRIMARY KEY,
        "certificateNumber" VARCHAR(100) UNIQUE NOT NULL,
        "certificateType" VARCHAR(100) NOT NULL,
        "apiaryId" INTEGER REFERENCES "apiaries"("id") ON DELETE CASCADE,
        "issuedDate" DATE NOT NULL,
        "expiryDate" DATE,
        "issuingAuthority" VARCHAR(255) NOT NULL,
        "status" VARCHAR(50) DEFAULT 'active',
        "requirements" TEXT,
        "notes" TEXT,
        "documentPath" VARCHAR(500),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create audit_logs table
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "beeusers"("id") ON DELETE SET NULL,
        "action" VARCHAR(100) NOT NULL,
        "tableName" VARCHAR(100) NOT NULL,
        "recordId" INTEGER,
        "oldValues" JSONB,
        "newValues" JSONB,
        "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS "idx_apiaries_ownerId" ON "apiaries"("ownerId");
      CREATE INDEX IF NOT EXISTS "idx_hives_apiaryId" ON "hives"("apiaryId");
      CREATE INDEX IF NOT EXISTS "idx_inspections_hiveId" ON "inspections"("hiveId");
      CREATE INDEX IF NOT EXISTS "idx_inspections_date" ON "inspections"("inspectionDate");
      CREATE INDEX IF NOT EXISTS "idx_honey_harvests_hiveId" ON "honey_harvests"("hiveId");
      CREATE INDEX IF NOT EXISTS "idx_honey_harvests_date" ON "honey_harvests"("harvestDate");
      CREATE INDEX IF NOT EXISTS "idx_treatments_hiveId" ON "treatments"("hiveId");
      CREATE INDEX IF NOT EXISTS "idx_treatments_date" ON "treatments"("applicationDate");
      CREATE INDEX IF NOT EXISTS "idx_feeding_records_hiveId" ON "feeding_records"("hiveId");
      CREATE INDEX IF NOT EXISTS "idx_certificates_apiaryId" ON "certificates"("apiaryId");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_userId" ON "audit_logs"("userId");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");

      -- Create trigger function for updating timestamps
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for automatic timestamp updates
      CREATE TRIGGER update_beeusers_updated_at BEFORE UPDATE ON "beeusers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_apiaries_updated_at BEFORE UPDATE ON "apiaries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_hives_updated_at BEFORE UPDATE ON "hives" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON "inspections" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_honey_harvests_updated_at BEFORE UPDATE ON "honey_harvests" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON "treatments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_feeding_records_updated_at BEFORE UPDATE ON "feeding_records" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON "certificates" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await client.query(schemaSQL);
    console.log(`Schema created successfully for database ${databaseName}`);
  } catch (error) {
    console.error('Error creating company schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function dropCompanyDatabase(companySlug: string): Promise<void> {
  const masterConfig = getDatabaseConfig('postgres');
  const client = new Client(masterConfig);
  const companyDbName = `honey_certify_${companySlug}`;

  try {
    await client.connect();
    
    // Terminate all connections to the database before dropping
    await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${companyDbName}' AND pid <> pg_backend_pid()
    `);
    
    // Drop the database
    await client.query(`DROP DATABASE IF EXISTS "${companyDbName}"`);
    
    // Remove from cache
    companyPrismaClients.delete(companySlug);
    
    console.log(`Database ${companyDbName} dropped successfully`);
  } catch (error) {
    console.error('Error dropping company database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function disconnectCompanyPrismaClient(companySlug: string): Promise<void> {
  const client = companyPrismaClients.get(companySlug);
  if (client) {
    await client.$disconnect();
    companyPrismaClients.delete(companySlug);
  }
}

export async function disconnectAllPrismaClients(): Promise<void> {
  const disconnectPromises = Array.from(companyPrismaClients.values()).map(client => 
    client.$disconnect()
  );
  
  await Promise.all(disconnectPromises);
  companyPrismaClients.clear();
}