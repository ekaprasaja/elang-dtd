import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/bridge') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    const sessionCookie = request.cookies.get('dtd_session_user_id')?.value;
    const isAuthenticated = sessionCookie && sessionCookie !== 'logged_out' && sessionCookie !== 'guest';

    // If already logged in and visiting /login, redirect to dashboard
    if (pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // Check authentication session cookie
  const sessionCookie = request.cookies.get('dtd_session_user_id')?.value;
  const isAuthenticated = sessionCookie && sessionCookie !== 'logged_out' && sessionCookie !== 'guest';

  if (!isAuthenticated) {
    // If it's an API request, return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Akses tidak sah. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    // Redirect to login page for UI views
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
