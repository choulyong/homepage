/**
 * Clear All Cookies API - 모든 쿠키 삭제
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // session 쿠키 삭제
    cookieStore.delete('session');

    // Supabase 관련 쿠키들도 삭제
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
      }
    }

    console.log('✅ All cookies cleared');

    return NextResponse.json({
      success: true,
      message: 'All cookies cleared'
    });
  } catch (error) {
    console.error('Clear cookies error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}
