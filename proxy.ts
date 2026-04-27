import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { auth } from '@/lib/auth';
import { locales, defaultLocale } from './i18n/config';

// Create the next-intl middleware for public routes
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes with auth protection
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    
    // For login page, only check if already authenticated to redirect
    // This avoids unnecessary session checks on the login page
    if (isLoginPage) {
      const session = await auth();
      if (session?.user) {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
        const redirectUrl = new URL(callbackUrl || '/admin', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      // Not authenticated, allow login page to render
      return NextResponse.next();
    }
    
    // For non-login admin routes, check authentication
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL('/admin/login', request.url);
      // Store the original URL to redirect back after login
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow the request to proceed for authenticated admin routes
    return NextResponse.next();
  }

  // For non-admin routes, use next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except static files and api routes
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Next.js internals (_next)
    // - Static files (files with extensions)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
