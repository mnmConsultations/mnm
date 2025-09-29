import { NextResponse } from 'next/server';

export function middleware(request) {
  // Allow all requests to pass through to client-side authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
