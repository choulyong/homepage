/**
 * Next.js Middleware
 * 관리자 페이지 보호
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAILS = [
  'choulyong@metaldragon.co.kr',
  'choulyong@gmail.com',
  'admin@metaldragon.co.kr',
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 관리자 페이지 접근 시 인증 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // /admin/login 페이지는 체크하지 않음
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 관리자가 아닌 경우 홈으로 리다이렉트
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
