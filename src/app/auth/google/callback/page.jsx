// app/auth/google/callback/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('[Google Callback] Code:', code);
        console.log('[Google Callback] State:', state);
        console.log('[Google Callback] Error:', error);

        // Handle OAuth errors
        if (error) {
          console.error('Google OAuth error:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // Verify state parameter for security
        if (state !== 'google_auth') {
          console.error('Invalid state parameter');
          setError('Security verification failed. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          setError('No authorization code received. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        console.log('[Google Callback] Calling API endpoint...');

        // Exchange authorization code for access token
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: `${window.location.origin}/auth/google/callback`
          }),
        });

        console.log('[Google Callback] API Response status:', response.status);

        const data = await response.json();
        console.log('[Google Callback] API Response data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Store the authentication token (same as login)
        if (data.token) {
          // Store in localStorage for client-side access
          localStorage.setItem('token', data.token);
          localStorage.setItem('authtoken', data.token);
          console.log('[Google Callback] Token stored in localStorage');
        }

        // Store user information if provided
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('[Google Callback] User data stored in localStorage');
        }

        console.log('[Google Callback] Redirecting to dashboard...');

        // Use the redirectUrl from the API response or default to dashboard
        const redirectUrl = data.redirectUrl || '/dashboard';
        router.push(redirectUrl);

      } catch (error) {
        console.error('Error during Google authentication:', error);
        setError(error.message || 'Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Google Authentication...</h2>
          <p className="text-gray-400">Please wait while we redirect you to your dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you back to login...</p>
        </div>
      </div>
    );
  }

  return null;
}