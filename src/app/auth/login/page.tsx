'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { setSession, clearSession } from '@/lib/auth-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/');

  useEffect(() => {
    // 페이지 로드 시 기존 세션 삭제
    clearSession();

    // URL에서 redirect 파라미터 읽기
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 로그인 시도:', { username, password });
      console.log('입력된 이메일:', username);
      console.log('입력된 비밀번호:', password);

      // 간단한 클라이언트 측 인증
      const correctEmail = 'choulyong@gmail.com';
      const correctPassword = 'gksrnr82^^';

      const isAdmin = username.trim() === correctEmail && password === correctPassword;

      console.log('이메일 일치?', username.trim() === correctEmail);
      console.log('비밀번호 일치?', password === correctPassword);
      console.log('관리자 인증?', isAdmin);

      if (!isAdmin) {
        console.error('❌ 로그인 실패 - 잘못된 인증 정보');
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      // 세션 정보 생성
      const userSession = {
        id: 'admin_user',
        username: username.trim(),
        email: username.trim(),
        isAdmin: true,
      };

      console.log('📝 세션 저장 시도:', userSession);

      // localStorage에 저장
      setSession(userSession);

      // 저장 확인
      const savedSession = localStorage.getItem('metaldragon_session');
      console.log('💾 localStorage 저장 확인:', savedSession);

      console.log('✅ 로그인 성공');

      // 커스텀 이벤트 발행 (Header가 리스닝)
      window.dispatchEvent(new Event('userLoggedIn'));

      alert('로그인 성공! 페이지를 이동합니다.');

      // 짧은 대기 후 리다이렉트
      setTimeout(() => {
        console.log('🔄 리다이렉트:', redirectUrl);
        router.push(redirectUrl);
      }, 100);
    } catch (err: any) {
      console.error('❌ 로그인 에러:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-display font-bold gradient-text">
            METALDRAGON
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            아직 계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-medium text-red-600 hover:text-red-500">
              회원가입
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Username/Email */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 sm:text-sm"
                placeholder="이메일을 입력하세요"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 sm:text-sm"
                placeholder="비밀번호"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                로그인 중...
              </span>
            ) : (
              '로그인'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-3xl font-display font-bold gradient-text mb-4">
          METALDRAGON
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
