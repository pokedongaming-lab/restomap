import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip auth check for certain paths
  const publicPaths = ['/auth', '/api/auth', '/_next', '/favicon.ico', '/']
  
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('restomap:auth_token')?.value 
    ?? request.headers.get('authorization')?.replace('Bearer ', '')
    ?? localStorage?.getItem('restomap:auth_token')

  // For now, allow access to map and other pages
  // TODO: Enable strict auth after testing
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
