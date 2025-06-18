// app/api/auth/google/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const googleClientId = "896087510989-utfed3b8g0i934mdr2nrfo0hpk6b46k3.apps.googleusercontent.com";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/google/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret ?? '',
        code: String(code),
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    return NextResponse.json(tokenData);

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler to retrieve stored token for authenticated users
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Here you would typically retrieve the stored Google token from your database
    // For now, returning a placeholder response since the token storage logic isn't shown
    
    // Example of what you might do:
    // const user = await prisma.user.findUnique({
    //   where: { id: parseInt(userId) },
    //   select: { googleAccessToken: true }
    // });
    
    // if (!user?.googleAccessToken) {
    //   return NextResponse.json(
    //     { error: 'No Google token found' },
    //     { status: 404 }
    //   );
    // }
    
    // return NextResponse.json({ token: user.googleAccessToken });

    return NextResponse.json(
      { error: 'Token retrieval not implemented' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Token retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}