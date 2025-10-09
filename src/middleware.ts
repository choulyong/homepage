/**
 * Next.js Middleware
 * Handles Supabase session refresh and auth protection
 */

import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
