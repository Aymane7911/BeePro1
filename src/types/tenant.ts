// types/tenant.ts
export interface TenantConfig {
  id: string;
  companyName: string;
  databaseUrl: string;
  subdomain: string;
  createdAt: Date;
  isActive: boolean;
}

// lib/database/tenant-manager.ts
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

class TenantManager {
  private masterDb: PrismaClient;
  private tenantClients: Map<string, PrismaClient> = new Map();

  constructor() {
    // Master database connection
    this.masterDb = new PrismaClient({
      datasources: {
        db: {
          url: process.env.MASTER_DATABASE_URL
        }
      }
    });
  }

  // Create a new tenant database
  async createTenant(companyName: string, subdomain: string): Promise<TenantConfig> {
    const tenantId = this.generateTenantId(companyName);
    const dbName = `tenant_${tenantId}`;
    
    // Create database
    await this.createDatabase(dbName);
    
    // Build connection string
    const databaseUrl = `${process.env.DATABASE_BASE_URL}/${dbName}`;
    
    // Store tenant info in master database
    const tenant: TenantConfig = {
      id: tenantId,
      companyName,
      databaseUrl,
      subdomain,
      createdAt: new Date(),
      isActive: true
    };
    
    await this.storeTenantInfo(tenant);
    
    // Run migrations on new database
    await this.runMigrations(databaseUrl);
    
    return tenant;
  }

  // Get tenant database client
  async getTenantClient(tenantId: string): Promise<PrismaClient> {
    if (this.tenantClients.has(tenantId)) {
      return this.tenantClients.get(tenantId)!;
    }

    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const client = new PrismaClient({
      datasources: {
        db: {
          url: tenant.databaseUrl
        }
      }
    });

    this.tenantClients.set(tenantId, client);
    return client;
  }

  // Get tenant by subdomain
  async getTenantBySubdomain(subdomain: string): Promise<TenantConfig | null> {
    // This would query your master database
    // Implementation depends on your master DB structure
    return null; // Replace with actual implementation
  }

  private generateTenantId(companyName: string): string {
    return createHash('md5')
      .update(companyName + Date.now().toString())
      .digest('hex')
      .substring(0, 8);
  }

  private async createDatabase(dbName: string): Promise<void> {
    // Use a connection to PostgreSQL to create the database
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.POSTGRES_ADMIN_URL
    });
    
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}"`);
    await client.end();
  }

  private async storeTenantInfo(tenant: TenantConfig): Promise<void> {
    // Store in master database - implement based on your master DB schema
    // await this.masterDb.tenant.create({ data: tenant });
  }

  private async getTenantInfo(tenantId: string): Promise<TenantConfig | null> {
    // Retrieve from master database
    // return await this.masterDb.tenant.findUnique({ where: { id: tenantId } });
    return null; // Replace with actual implementation
  }

  private async runMigrations(databaseUrl: string): Promise<void> {
    // Use Prisma CLI or programmatic migration
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    process.env.DATABASE_URL = databaseUrl;
    await execAsync('npx prisma migrate deploy');
  }
}

export const tenantManager = new TenantManager();