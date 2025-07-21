// app/api/company/database-info/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { databaseName: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get database size (pseudo-code - actual implementation depends on DB)
    const dbSize = await getDatabaseSize(company.databaseName);

    return NextResponse.json({
      databaseName: company.databaseName,
      status: 'active',
      size: dbSize,
      lastBackup: company.lastBackup // Add this field to your Company model
    });
  } catch (error) {
    console.error(error);
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
  // Actual implementation would query your database metadata
  const sizes = ['245 MB', '312 MB', '178 MB', '420 MB'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}