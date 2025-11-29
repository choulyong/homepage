import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    console.log('🔍 /api/auth/me 호출됨');
    console.log('📦 쿠키에서 세션 읽기:', session ? '존재함' : '없음');

    if (!session) {
      console.log('❌ 세션 없음 - 로그인 필요');
      return NextResponse.json({ user: null });
    }

    // 세션 토큰 디코드 (userId:username:isAdmin)
    const decoded = Buffer.from(session.value, 'base64').toString('utf-8');
    console.log('🔓 디코딩된 세션:', decoded);

    const [userId, username, isAdminStr] = decoded.split(':');
    const isAdmin = isAdminStr === 'true';

    console.log('👤 파싱된 사용자:', { userId, username, isAdmin });

    return NextResponse.json({
      user: {
        id: userId,
        username: username,
        isAdmin: isAdmin,
      },
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    return NextResponse.json({ user: null });
  }
}
