/**
 * Auth Callback Route Handler
 * OAuth 리다이렉트 처리 (Google, GitHub)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Admin 대시보드로 리다이렉트
  return NextResponse.redirect(`${origin}/admin`);
}
