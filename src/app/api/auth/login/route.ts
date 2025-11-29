import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // 간단한 인증 (실제로는 데이터베이스에서 확인해야 함)
    // 관리자 확인 (특정 이메일과 비밀번호)
    const isAdmin = username === 'choulyong@gmail.com' && password === 'gksrnr82^^';

    const userId = isAdmin ? 'admin_user' : `user_${Date.now()}`;

    // Session token: userId:username:isAdmin
    const sessionToken = Buffer.from(`${userId}:${username}:${isAdmin}`).toString('base64');

    console.log('🔐 로그인 성공:', { userId, username, isAdmin });
    console.log('🍪 세션 토큰 생성:', sessionToken);

    // 쿠키에 세션 저장
    // ⚠️ httpOnly: false - 클라이언트에서 쿠키를 읽을 수 있도록 설정
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: false, // 클라이언트에서 접근 가능하도록 변경
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // 명시적으로 path 설정
    });

    console.log('✅ 쿠키 설정 완료');

    // Response에 쿠키 헤더도 명시적으로 추가
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: username,
        isAdmin: isAdmin,
      },
      sessionToken: sessionToken, // 디버깅용
    });

    // Set-Cookie 헤더 명시적으로 추가 (백업)
    response.cookies.set('session', sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
