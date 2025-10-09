/**
 * Signup Page - Tailwind CSS Design
 * Based on appy-html template with teal-indigo gradient
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createClient();

      // 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('회원가입 성공! 이메일을 확인해주세요.');

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Title with Gradient */}
          <h1 className="text-3xl font-display font-bold text-center mb-8 bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
            회원가입
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                사용자 이름
              </label>
              <input
                id="username"
                type="text"
                placeholder="홍길동"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-white">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
