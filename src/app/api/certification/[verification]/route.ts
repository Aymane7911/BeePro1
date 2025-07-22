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

    console.log('Looking for verification code:', verificationCode);

    // Option 1: Use findFirst instead of findUnique if you want to search by verificationCode only
    const certification = await prisma.certification.findFirst({
      where: {
        verificationCode: verificationCode
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phonenumber: true,
            isProfileComplete: true,
          }
        }
      }
    });

    // Option 2: If you need to use findUnique with compound key, you'll need both fields
    // Uncomment this and comment out the findFirst above if you have the databaseId
    /*
    const certification = await prisma.certification.findUnique({
      where: {
        verificationCode_databaseId: {
          verificationCode: verificationCode,
          databaseId: "your_database_id_here" // You'll need to get this value
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phonenumber: true,
            isProfileComplete: true,
          }
        }
      }
    });
    */

    console.log('Found certification:', certification);

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Construct beekeeper name from user profile
    let beekeeperName = null;
    
    if (certification.user) {
      const { firstname, lastname } = certification.user;
      
      // Fixed: Better null/undefined checking and string validation
      const validFirstname = firstname && typeof firstname === 'string' && firstname.trim() !== '';
      const validLastname = lastname && typeof lastname === 'string' && lastname.trim() !== '';
      
      if (validFirstname || validLastname) {
        // Only trim if the value exists and is a string
        const parts = [];
        if (validFirstname) parts.push(firstname.trim());
        if (validLastname) parts.push(lastname.trim());
        beekeeperName = parts.join(' ');
      }
      
      // Debug logging
      console.log('User firstname:', firstname);
      console.log('User lastname:', lastname);
      console.log('Valid firstname:', validFirstname);
      console.log('Valid lastname:', validLastname);
      console.log('Constructed beekeeperName:', beekeeperName);
    }

    // Fallback to stored beekeeperName if user profile doesn't have complete info
    if (!beekeeperName && certification.beekeeperName) {
      const storedName = certification.beekeeperName.trim();
      // Only use if doesn't contain placeholder values
      if (storedName && 
          !storedName.includes('undefined') && 
          !storedName.includes('null') &&
          storedName !== 'undefined undefined' &&
          storedName !== 'null null') {
        beekeeperName = storedName;
      }
      
      // Debug logging
      console.log('Stored beekeeperName:', certification.beekeeperName);
      console.log('Using stored name:', beekeeperName);
    }

    // If still no name, provide a fallback
    if (!beekeeperName) {
      beekeeperName = 'Name not available';
      console.log('No valid beekeeper name found, using fallback');
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
      createdAt: certification.createdAt.toISOString(),
      // Additional beekeeper info if available
      beekeeperInfo: certification.user ? {
        email: certification.user.email,
        phone: certification.user.phonenumber,
        profileComplete: certification.user.isProfileComplete,
      } : null,
    };

    console.log('Sending response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching certification:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}