// src/app/api/company/database-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions, authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    let databaseId: string | null = null;
    let companyId: string | null = null;

    // First try to get session from NextAuth (for web app users)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session?.user?.companyId) {
      userId = session.user.id;
      companyId = session.user.companyId;
      
      // Option 1: Get databaseId from company relationship
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { databaseId: true }
      });
      databaseId = company?.databaseId || null;
    } else {
      // Fallback to JWT authentication (for API users)
      const authResult = await authenticateRequest(request);
      if (authResult) {
        userId = authResult.userId;
        databaseId = authResult.databaseId;
      }
    }
        
    if (!userId || !databaseId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const database = await prisma.database.findUnique({
      where: { id: databaseId },
      select: {
        name: true,
        displayName: true,
        isActive: true,
        maxUsers: true,
        maxStorage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    // Get database size (pseudo-code - actual implementation depends on DB)
    const dbSize = await getDatabaseSize(database.name);

    return NextResponse.json({
      databaseName: database.name,
      displayName: database.displayName,
      status: database.isActive ? 'active' : 'inactive',
      size: dbSize,
      maxUsers: database.maxUsers,
      maxStorage: `${database.maxStorage} GB`,
      createdAt: database.createdAt,
      updatedAt: database.updatedAt
    });
  } catch (error) {
    console.error('Database info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Mock implementation - replace with actual DB query
async function getDatabaseSize(dbName: string): Promise<string> {
  // For PostgreSQL, you might use something like:
  // const result = await prisma.$queryRaw`
  //   SELECT pg_size_pretty(pg_database_size(${dbName})) as size
  // `;
  
  const sizes = ['245 MB', '312 MB', '178 MB', '420 MB'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}