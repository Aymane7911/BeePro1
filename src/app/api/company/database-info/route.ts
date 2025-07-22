// app/api/company/database-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path as needed

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Use getServerSession instead of getSession for API routes
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.databaseId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const database = await prisma.database.findUnique({
      where: { id: session.user.databaseId },
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