/**
 * Admin Site Settings - Rock Community
 * Manage site-wide settings for METALDRAGON
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SiteSetting {
  key: string;
  value: string;
  description: string;
}

export default function SiteSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Rock Community specific settings
  const [settings, setSettings] = useState<SiteSetting[]>([
    {
      key: 'site_title',
      value: 'METALDRAGON',
      description: '사이트 메인 타이틀',
    },
    {
      key: 'site_description',
      value: 'Rock & Metal Community - Latest News, Bands, Albums, Concerts',
      description: '사이트 설명 (SEO)',
    },
    {
      key: 'hero_title',
      value: '🤘 Welcome to METALDRAGON',
      description: '홈페이지 히어로 타이틀',
    },
    {
      key: 'hero_subtitle',
      value: 'Your Ultimate Rock & Metal Community',
      description: '홈페이지 히어로 부제목',
    },
    {
      key: 'contact_email',
      value: 'contact@metaldragon.com',
      description: '문의 이메일',
    },
    {
      key: 'featured_band_id',
      value: '',
      description: '추천 밴드 ID (UUID)',
    },
    {
      key: 'announcement',
      value: '',
      description: '공지사항 (비어있으면 표시 안함)',
    },
  ]);

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const isAdmin =
        user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID ||
        user.user_metadata?.role === 'admin';

      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }

      setUser(user);
      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/auth/login');
    }
  };

  const loadSettings = () => {
    // Load from localStorage
    const saved = localStorage.getItem('site_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
  };

  const handleSave = () => {
    setSaving(true);
    setMessage('');

    try {
      // Save to localStorage
      localStorage.setItem('site_settings', JSON.stringify(settings));
      setMessage('✅ 설정이 성공적으로 저장되었습니다!');

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setMessage(`❌ 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ⚙️ 사이트 설정
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            METALDRAGON 홈페이지 기본 설정을 관리합니다
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-zinc-800">
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {setting.description}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  키: {setting.key}
                </p>
                {setting.key.includes('subtitle') ||
                setting.key.includes('description') ||
                setting.key.includes('announcement') ? (
                  <textarea
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={setting.description}
                  />
                ) : (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={setting.description}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium disabled:opacity-50"
            >
              {saving ? '저장 중...' : '💾 변경사항 저장'}
            </button>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes('성공')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-xl shadow-lg p-8 border border-amber-500/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            사용 가이드
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>사이트 타이틀</strong>: 브라우저 탭과 검색 엔진에 표시되는 사이트 이름
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>히어로 타이틀/부제목</strong>: 홈페이지 메인 화면 상단에 표시되는 텍스트
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>추천 밴드 ID</strong>: 홈페이지에 추천으로 표시할 밴드의 UUID (선택사항)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>공지사항</strong>: 비어있으면 표시되지 않음. 내용 입력 시 홈페이지 상단에 표시
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">⚠️</span>
              <span>
                변경사항은 저장 후 홈페이지를 새로고침하면 즉시 반영됩니다
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
