// utils/database.ts
import { PrismaClient } from '@prisma/client';

class DatabaseManager {
  private static instance: DatabaseManager;
  private clients: Map<string, PrismaClient> = new Map();
  private masterClient: PrismaClient;

  private constructor() {
    this.masterClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  getMasterDatabase(): PrismaClient {
    return this.masterClient;
  }

  async getCompanyDatabase(companyId: string): Promise<PrismaClient> {
    if (this.clients.has(companyId)) {
      return this.clients.get(companyId)!;
    }

    const databaseUrl = `${process.env.DATABASE_URL_BASE}_${companyId}`;
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    this.clients.set(companyId, client);
    return client;
  }

  async initializeCompanyDatabase(companyId: string): Promise<void> {
    try {
      // Create database
      await this.createDatabase(companyId);
      
      // Run migrations
      await this.runMigrations(companyId);
      
      console.log(`Database initialized for company ${companyId}`);
    } catch (error) {
      console.error(`Failed to initialize database for company ${companyId}:`, error);
      throw error;
    }
  }

  private async createDatabase(companyId: string): Promise<void> {
    const { Client } = require('pg');
    
    // Parse the base URL to get connection details
    const baseUrl = new URL(process.env.DATABASE_URL_BASE!);
    
    const client = new Client({
      host: baseUrl.hostname,
      port: baseUrl.port || 5432,
      user: baseUrl.username,
      password: baseUrl.password,
      database: 'postgres', // Connect to default database to create new one
    });

    try {
      await client.connect();
      await client.query(`CREATE DATABASE "company_${companyId}"`);
      console.log(`Database created: company_${companyId}`);
    } catch (error) {
      if (error.code !== '42P04') { // Database already exists
        throw error;
      }
    } finally {
      await client.end();
    }
  }

  private async runMigrations(companyId: string): Promise<void> {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    try {
      const databaseUrl = `${process.env.DATABASE_URL_BASE}_${companyId}`;
      await execAsync(`DATABASE_URL="${databaseUrl}" npx prisma migrate deploy`);
      console.log(`Migrations completed for company ${companyId}`);
    } catch (error) {
      console.error(`Migration failed for company ${companyId}:`, error);
      throw error;
    }
  }

  async disconnectAll(): Promise<void> {
    await this.masterClient.$disconnect();
    
    for (const [companyId, client] of this.clients) {
      await client.$disconnect();
    }
    this.clients.clear();
  }
}

export default DatabaseManager;