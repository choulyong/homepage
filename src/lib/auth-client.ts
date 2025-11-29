/**
 * Client-side localStorage 기반 인증 유틸리티
 */

const SESSION_KEY = 'metaldragon_session';

interface UserSession {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

/**
 * 세션 저장
 */
export function setSession(user: UserSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    console.log('✅ Session saved to localStorage:', user);
  } catch (error) {
    console.error('❌ Failed to save session:', error);
  }
}

/**
 * 세션 가져오기
 */
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionData = localStorage.getItem(SESSION_KEY);

    if (!sessionData) {
      console.log('❌ No session found in localStorage');
      return null;
    }

    const user = JSON.parse(sessionData);
    console.log('✅ Session loaded from localStorage:', user);
    return user;
  } catch (error) {
    console.error('❌ Failed to load session:', error);
    return null;
  }
}

/**
 * 세션 삭제 (로그아웃)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('✅ Session cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear session:', error);
  }
}

/**
 * 현재 사용자 정보 가져오기
 */
export function getCurrentUser(): UserSession | null {
  return getSession();
}

/**
 * 로그인 여부 확인
 */
export function isLoggedIn(): boolean {
  return getSession() !== null;
}
