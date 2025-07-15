import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  let companyId: string | null = null;
  
  // Method 1: From subdomain (e.g., company1.yourdomain.com)
  const host = request.headers.get('host');
  if (host) {
    const subdomain = host.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'localhost' && !subdomain.includes('yourdomain')) {
      companyId = subdomain;
    }
  }
  
  // Method 2: From URL path (e.g., /company/company-id/...)
  const pathSegments = request.nextUrl.pathname.split('/');
  if (pathSegments[1] === 'company' && pathSegments[2]) {
    companyId = pathSegments[2];
  }
  
  // Method 3: From token (if user is logged in)
  if (token?.companyId) {
    companyId = token.companyId as string;
  }
  
  // Method 4: From query parameter
  const companyFromQuery = request.nextUrl.searchParams.get('company');
  if (companyFromQuery) {
    companyId = companyFromQuery;
  }
  
  // Add company ID to request headers for use in API routes
  if (companyId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-company-id', companyId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/company/:path*',
  ],
};