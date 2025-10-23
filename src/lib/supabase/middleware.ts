/**
 * Supabase Middleware for Auth
 * Handles session refresh and cookie management
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (에러 핸들링 개선)
  try {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    // 토큰 갱신 실패 시 에러 핸들링
    if (getUserError && getUserError.status === 401) {
      // Refresh token 시도
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshData.session) {
          // 토큰 갱신 실패 시 쿠키 제거
          supabaseResponse.cookies.delete('sb-auth-token');
          supabaseResponse.cookies.delete('sb-refresh-token');

          // 관리자 페이지면 로그인으로 리다이렉트
          if (request.nextUrl.pathname.startsWith('/admin')) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
          }
        }
      } catch (refreshError) {
        // 갱신 중 에러 발생 시 쿠키 제거
        supabaseResponse.cookies.delete('sb-auth-token');
        supabaseResponse.cookies.delete('sb-refresh-token');

        if (request.nextUrl.pathname.startsWith('/admin')) {
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          return NextResponse.redirect(url);
        }
      }
    } else if (!user) {
      // 사용자가 없는 경우
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
  } catch (error: any) {
    // Auth 에러는 무시하되, 관리자 페이지는 차단
    console.error('Auth middleware error:', error?.message);

    if (request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
