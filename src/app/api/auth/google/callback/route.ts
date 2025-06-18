// app/api/auth/google/callback/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Google OAuth API] Request body:', body);

    const { code, redirect_uri } = body;

    if (!code) {
      console.log('[Google OAuth API] Missing authorization code');
      return NextResponse.json({ message: 'Authorization code is required' }, { status: 400 });
    }

    // Optional DEBUG: check env vars (remove in production)
    console.log('[DEBUG] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'NOT SET');
    console.log('[DEBUG] GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[Google OAuth API] Token exchange failed:', errorData);
      return NextResponse.json({ message: 'Failed to exchange code for token' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('[Google OAuth API] Token exchange successful');

    // Fetch user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('[Google OAuth API] Failed to fetch user info');
      return NextResponse.json({ message: 'Failed to fetch user information' }, { status: 400 });
    }

    const googleUserData: GoogleUserData = await userResponse.json();
    console.log('[Google OAuth API] Google user data:', googleUserData);

    // Check for existing user
    const existingUserResult = await pool.query('SELECT * FROM beeusers WHERE email = $1', [googleUserData.email]);
    let user;

    if (existingUserResult.rowCount === 0) {
      // Create new user
      const nameParts = googleUserData.name.split(' ');
      const firstname = nameParts[0] || 'Google';
      const lastname = nameParts.slice(1).join(' ') || 'User';

      const createUserResult = await pool.query(
        'INSERT INTO beeusers (firstname, lastname, email, password, is_confirmed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [firstname, lastname, googleUserData.email, 'google_oauth', true]
      );

      user = createUserResult.rows[0];
      console.log('[Google OAuth API] New user created:', user);
    } else {
      user = existingUserResult.rows[0];
      console.log('[Google OAuth API] Existing user found:', user);

      if (!user.is_confirmed) {
        await pool.query('UPDATE beeusers SET is_confirmed = true WHERE id = $1', [user.id]);
        user.is_confirmed = true;
        console.log('[Google OAuth API] User email confirmed');
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`;

    const response = NextResponse.json(
      {
        message: 'Google authentication successful',
        token,
        redirectUrl,
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          name: `${user.firstname} ${user.lastname}`,
          picture: googleUserData.picture,
          verified_email: googleUserData.verified_email,
          is_confirmed: user.is_confirmed,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[Google OAuth API] Unexpected error:', error.message, error.stack);
    return NextResponse.json({ message: 'Server error during Google authentication' }, { status: 500 });
  }
}
