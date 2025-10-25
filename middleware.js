import { NextResponse } from 'next/server';

/**
 * Next.js middleware that intercepts requests to protected routes
 * Currently configured for client-side authentication handling
 * All dashboard routes pass through to allow client-side auth checks
 */
export function middleware(request) {
  return NextResponse.next();
}

/**
 * Configuration specifying which routes this middleware applies to
 * Matches all routes under /dashboard/* including nested paths
 */
export const config = {
  matcher: ['/dashboard/:path*']
};
