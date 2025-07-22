import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// JWT verification helper
function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();          // ← add await
  const token  = cookieStore.get('token')?.value || '';

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log('Decoded User ID:', userId);

    // Parse form data
    const formData = await req.formData();
    const passportId = formData.get('passportId') as string;
    const phonenumber = formData.get('phonenumber') as string;
    const passportFile = formData.get('passportFile') as File;

    // Validate required fields
    if (!passportId || !phonenumber || !passportFile) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phonenumber)) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    // Validate file type (PDF only)
    if (passportFile.type !== 'application/pdf') {
      return NextResponse.json({ message: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Save file
    const bytes = await passportFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `passport-${Date.now()}-${userId}.pdf`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, filename);
    await writeFile(uploadPath, buffer);

    const filePath = `/uploads/${filename}`;

    // Update user profile
    const updatedUser = await prisma.beeusers.update({
      where: { id: userId },
      data: {
        passportId,
        phonenumber,
        passportFile: filePath,
        isProfileComplete: true,
      },
    });

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        isProfileComplete: true,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Create response
    const response = NextResponse.json({ 
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isProfileComplete: true
      }
    });

    // Set new cookie
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}