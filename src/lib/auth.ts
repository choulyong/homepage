import { cookies } from 'next/headers';

/**
 * Cookie 기반 인증 - 세션 쿠키에서 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      console.log('🔐 getCurrentUser: No session cookie found');
      return null;
    }

    // Session token decode: userId:username:isAdmin
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const [userId, username, isAdmin] = decoded.split(':');

    console.log('🔐 getCurrentUser: Session found:', { userId, username, isAdmin });

    return {
      id: userId,
      username: username,
      email: username, // username을 email로도 사용
      isAdmin: isAdmin === 'true',
    };
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * 인증 필수 - 로그인되지 않은 경우 에러 발생
 */
export async function requireAuth() {
  console.log('🔐 requireAuth: Checking user authentication...');
  const user = await getCurrentUser();

  if (!user) {
    console.error('❌ requireAuth: No user found - Unauthorized!');
    throw new Error('Unauthorized: You must be logged in to perform this action');
  }

  console.log('✅ requireAuth: User authenticated:', user.username);
  return user;
}
