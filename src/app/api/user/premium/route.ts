// app/api/user/premium/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Function to extract token from request
function getTokenFromRequest(request: NextRequest) {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies as fallback
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }
  
  return null;
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('=== PATCH /api/user/premium ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Get token from request
    const token = getTokenFromRequest(request);
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('❌ No token found, returning 401');
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('Token decoded:', decoded);
    
    if (!decoded || !decoded.email) {
      console.log('❌ Invalid token or no email in token, returning 401');
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { isPremium } = body;

    if (typeof isPremium !== 'boolean') {
      console.log('❌ Invalid isPremium value:', isPremium);
      return NextResponse.json({ error: 'Invalid premium status' }, { status: 400 });
    }

    console.log('🔄 Updating user premium status for:', decoded.email);
    console.log('Setting isPremium to:', isPremium);

    // Update user premium status in database
    const updatedUser = await prisma.beeusers.update({
      where: { email: decoded.email },
      data: { 
        isPremium: isPremium,
        premiumStartedAt: isPremium ? new Date() : null,
        premiumExpiresAt: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null // 1 year from now
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
        premiumStartedAt: true,
        premiumExpiresAt: true
      }
    });

    console.log('✅ User updated successfully:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
   
  } catch (error) {
    console.error('❌ Error updating premium status:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/user/premium ===');
    
    // Get token from request
    const token = getTokenFromRequest(request);
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('❌ No token found, returning 401');
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('Token decoded:', decoded);
    
    if (!decoded || !decoded.email) {
      console.log('❌ Invalid token or no email in token, returning 401');
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    console.log('🔄 Fetching user premium status for:', decoded.email);

    // Get user premium status from database
    const user = await prisma.beeusers.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        email: true,
        isPremium: true,
        premiumStartedAt: true,
        premiumExpiresAt: true
      }
    });

    console.log('User found in database:', user);

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User premium status fetched successfully');
    return NextResponse.json({
      success: true,
      user: user
    });
   
  } catch (error) {
    console.error('❌ Error fetching user premium status:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}