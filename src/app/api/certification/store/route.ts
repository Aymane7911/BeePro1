// app/api/certification/store/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token (adjust according to your JWT implementation)
    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      userId = decoded.userId || decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      verificationCode,
      batchIds,
      certificationDate,
      totalCertified,
      certificationType,
      expiryDate,
      totalJars,
      companyName,
      beekeeperName,
      location
    } = body;

    // Validate required fields
    if (!verificationCode || !batchIds || !certificationDate || !totalCertified || !certificationType || !expiryDate || !totalJars) {
      return NextResponse.json(
        { error: 'Missing required certification data' },
        { status: 400 }
      );
    }

    // Check if verification code already exists
    const existingCert = await prisma.certification.findUnique({
      where: { verificationCode }
    });

    if (existingCert) {
      return NextResponse.json(
        { error: 'Verification code already exists' },
        { status: 409 }
      );
    }

    // Create new certification record
    const certification = await prisma.certification.create({
      data: {
        verificationCode,
        batchIds,
        certificationDate: new Date(certificationDate),
        totalCertified: parseFloat(totalCertified.toString()),
        certificationType,
        expiryDate: new Date(expiryDate),
        totalJars: parseInt(totalJars.toString()),
        companyName,
        beekeeperName,
        location,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      certification: {
        id: certification.id,
        verificationCode: certification.verificationCode,
        message: 'Certification stored successfully'
      }
    });

  } catch (error) {
    console.error('Error storing certification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}