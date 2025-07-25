// app/api/auth/google/callback/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

export async function POST(request: Request) {
  console.log('=== GOOGLE OAUTH DEBUG START ===');
  
  try {
    // Step 1: Parse request body
    console.log('[STEP 1] Parsing request body...');
    const body = await request.json();
    console.log('[STEP 1] Request body keys:', Object.keys(body));
    
    const { code, redirect_uri } = body;

    if (!code) {
      console.log('[ERROR] Missing authorization code');
      return NextResponse.json({ message: 'Authorization code is required' }, { status: 400 });
    }
    console.log('[STEP 1] ✓ Authorization code received');

    // Step 2: Check environment variables
    console.log('[STEP 2] Checking environment variables...');
    const envCheck = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      JWT_SECRET: !!process.env.JWT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      DEFAULT_DATABASE_ID: !!process.env.DEFAULT_DATABASE_ID,
    };
    console.log('[STEP 2] Environment variables:', envCheck);

    const missingVars = Object.entries(envCheck)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.log('[ERROR] Missing environment variables:', missingVars);
      return NextResponse.json({ 
        message: 'Server configuration error',
        missing: missingVars
      }, { status: 500 });
    }
    console.log('[STEP 2] ✓ All environment variables present');

    // Step 3: Exchange code for token
    console.log('[STEP 3] Exchanging code for access token...');
    const tokenParams = {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
    };
    console.log('[STEP 3] Token exchange redirect_uri:', tokenParams.redirect_uri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    console.log('[STEP 3] Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.log('[ERROR] Token exchange failed:', errorData);
      return NextResponse.json({ 
        message: 'Failed to exchange code for token',
        status: tokenResponse.status,
        error: errorData
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('[STEP 3] ✓ Token exchange successful');

    // Step 4: Get user info from Google
    console.log('[STEP 4] Fetching user info from Google...');
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    console.log('[STEP 4] User info response status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log('[ERROR] Failed to fetch user info:', errorText);
      return NextResponse.json({ 
        message: 'Failed to fetch user information',
        error: errorText
      }, { status: 400 });
    }

    const googleUserData: GoogleUserData = await userResponse.json();
    console.log('[STEP 4] ✓ Google user data received for:', googleUserData.email);

    // Step 5: Test database connection
    console.log('[STEP 5] Testing database connection...');
    try {
      await pool.query('SELECT NOW()');
      console.log('[STEP 5] ✓ Database connection successful');
    } catch (dbError: any) {
      console.log('[ERROR] Database connection failed:', dbError.message);
      return NextResponse.json({ 
        message: 'Database connection error',
        error: dbError.message
      }, { status: 500 });
    }

    // Step 6: Get default database ID
    console.log('[STEP 6] Getting default database...');
    
    // Try using environment variable first
    let defaultDatabaseId = process.env.DEFAULT_DATABASE_ID;
    
    if (!defaultDatabaseId) {
      console.log('[STEP 6] No DEFAULT_DATABASE_ID in env, querying database...');
      const defaultDatabaseResult = await pool.query(
        'SELECT id FROM databases WHERE is_active = true ORDER BY created_at ASC LIMIT 1'
      );

      if (defaultDatabaseResult.rowCount === 0) {
        console.log('[ERROR] No active database found');
        return NextResponse.json({ message: 'No active database available' }, { status: 500 });
      }

      defaultDatabaseId = defaultDatabaseResult.rows[0].id;
    }
    
    console.log('[STEP 6] ✓ Using database ID:', defaultDatabaseId);

    // Step 7: Check for existing user
    console.log('[STEP 7] Checking for existing user...');
    const existingUserResult = await pool.query(
      'SELECT * FROM beeusers WHERE email = $1 AND database_id = $2', 
      [googleUserData.email, defaultDatabaseId]
    );
    
    console.log('[STEP 7] Existing user query result rows:', existingUserResult.rowCount);
    
    let user;

    if (existingUserResult.rowCount === 0) {
      console.log('[STEP 8] Creating new user...');
      // Create new user
      const nameParts = googleUserData.name.split(' ');
      const firstname = nameParts[0] || 'Google';
      const lastname = nameParts.slice(1).join(' ') || 'User';

      const createUserResult = await pool.query(
        'INSERT INTO beeusers (database_id, firstname, lastname, email, password, is_confirmed, google_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [defaultDatabaseId, firstname, lastname, googleUserData.email, 'google_oauth', true, googleUserData.id]
      );

      user = createUserResult.rows[0];
      console.log('[STEP 8] ✓ New user created with ID:', user.id);
    } else {
      user = existingUserResult.rows[0];
      console.log('[STEP 8] ✓ Existing user found with ID:', user.id);

      // Update user if needed
      if (!user.google_id) {
        await pool.query('UPDATE beeusers SET google_id = $1 WHERE id = $2', [googleUserData.id, user.id]);
        user.google_id = googleUserData.id;
        console.log('[STEP 8] ✓ Google ID updated');
      }

      if (!user.is_confirmed) {
        await pool.query('UPDATE beeusers SET is_confirmed = true WHERE id = $1', [user.id]);
        user.is_confirmed = true;
        console.log('[STEP 8] ✓ User email confirmed');
      }
    }

    // Step 9: Generate JWT
    console.log('[STEP 9] Generating JWT token...');
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        databaseId: user.database_id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    console.log('[STEP 9] ✓ JWT token generated');

    // Step 10: Prepare response
    console.log('[STEP 10] Preparing response...');
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
          database_id: user.database_id,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    console.log('[STEP 10] ✓ Response prepared successfully');
    console.log('=== GOOGLE OAUTH DEBUG SUCCESS ===');
    
    return response;

  } catch (error: any) {
    console.log('=== GOOGLE OAUTH DEBUG ERROR ===');
    console.error('[FATAL ERROR]', error.message);
    console.error('[STACK TRACE]', error.stack);
    console.log('=== END ERROR DEBUG ===');
    
    return NextResponse.json({ 
      message: 'Server error during Google authentication',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}