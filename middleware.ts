import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware for future server-side authentication
// Currently, authentication is handled client-side with Zustand
// This is a placeholder for when server-side auth is implemented

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Check if user is authenticated (check for auth storage in cookies or headers)
  // Since we're using client-side Zustand, we'll handle this on the client
  // This middleware is just for future server-side auth
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
