// app/api/certification/[verification]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ verification: string }> }
) {
  try {
    const { verification } = await params;
    const verificationCode = verification;

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    console.log('Looking for verification code:', verificationCode); // Debug log

    // Fetch certification data from database
    const certification = await prisma.certification.findUnique({
      where: {
        verificationCode: verificationCode
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          }
        }
      }
    });

    console.log('Found certification:', certification); // Debug log

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Fix the beekeeper name construction
    let beekeeperName = certification.beekeeperName;
    if (!beekeeperName && certification.user) {
      const firstname = certification.user.firstname || '';
      const lastname = certification.user.lastname || '';
      beekeeperName = `${firstname} ${lastname}`.trim();
      // If both are empty, set to null
      if (!beekeeperName) {
        beekeeperName = null;
      }
    }

    // Transform the data to match the expected format
    const response = {
      id: certification.id,
      verificationCode: certification.verificationCode,
      batchIds: certification.batchIds,
      certificationDate: certification.certificationDate.toISOString().split('T')[0],
      totalCertified: parseFloat(certification.totalCertified.toString()),
      certificationType: certification.certificationType,
      expiryDate: certification.expiryDate.toISOString().split('T')[0],
      totalJars: certification.totalJars,
      companyName: certification.companyName,
      beekeeperName: beekeeperName,
      location: certification.location,
      createdAt: certification.createdAt.toISOString()
    };

    console.log('Sending response:', response); // Debug log

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching certification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}