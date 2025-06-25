// lib/token-validator.ts - Client-side token validation
import { performLogout } from './auth';

/**
 * Validates token by checking with server
 */
export async function validateToken(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[validateToken] Token validation failed');
      // Auto-logout if token is invalid
      await performLogout();
      window.location.href = '/login';
      return false;
    }

    return true;
  } catch (error) {
    console.error('[validateToken] Error validating token:', error);
    return false;
  }
}

/**
 * React hook for token validation
 */
export function useTokenValidation() {
  const checkToken = async () => {
    const isValid = await validateToken();
    if (!isValid) {
      // Token is invalid, user will be redirected to login
      return false;
    }
    return true;
  };

  return { checkToken };
}

// Token validation API endpoint
// app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      valid: true, 
      userId 
    });
  } catch (error) {
    console.error('[Token Validation] Error:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
  }
}