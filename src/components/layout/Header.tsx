/**
 * Header Component with Tailwind CSS
 * METALDRAGON - Rock Community Navigation
 * Fire Red & Rock Gold gradient with dark mode support
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SearchModal } from '@/components/SearchModal';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { getCurrentUser, clearSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // 초기 렌더링 시 localStorage에서 바로 로드 (성능 최적화)
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentUser();
    }
    return null;
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 로그인 이벤트 리스너만 추가 (초기 로드는 useState에서 처리)
    const handleLoginEvent = () => {
      console.log('🔔 Login event received - reloading user');
      const currentUser = getCurrentUser();
      console.log('🔐 Header - localStorage user:', currentUser);
      setUser(currentUser);
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  // 주요 메뉴 (데스크톱에 항상 표시)
  const primaryLinks = [
    { href: '/bands', label: 'Bands' },
    { href: '/albums', label: 'Albums' },
    { href: '/concerts', label: 'Concerts' },
    { href: '/community', label: 'Community' },
  ];

  // 모바일에서 카테고리별로 그룹화된 전체 메뉴
  const mobileMenuGroups = [
    {
      title: 'Main',
      links: [
        { href: '/about', label: 'About' },
        { href: '/bands', label: 'Bands' },
        { href: '/bands/countries', label: 'By Country' },
        { href: '/concerts', label: 'Concerts' },
      ],
    },
    {
      title: 'Albums',
      links: [
        { href: '/albums', label: 'All Albums' },
        { href: '/albums/korean', label: 'K-Rock' },
        { href: '/albums/legend', label: '대중음악 명반100' },
      ],
    },
    {
      title: 'Content',
      links: [
        { href: '/community', label: 'Community' },
        { href: '/news', label: 'News' },
        { href: '/gallery', label: '회원동영상' },
        { href: '/videos', label: 'Videos' },
        { href: '/ashdish', label: 'AshDish' },
        { href: '/rock-art', label: 'Rock Art' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ];

  // 데스크톱 전체 링크 (모든 메뉴 유지)
  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/bands', label: 'Bands' },
    { href: '/bands/countries', label: 'By Country' },
    { href: '/albums', label: 'Albums' },
    { href: '/albums/korean', label: 'K-Rock' },
    { href: '/albums/legend', label: '명반100' },
    { href: '/concerts', label: 'Concerts' },
    { href: '/community', label: 'Community' },
    { href: '/news', label: 'News' },
    { href: '/gallery', label: '회원동영상' },
    { href: '/ashdish', label: 'AshDish' },
    { href: '/rock-art', label: 'Rock Art' },
    { href: '/videos', label: 'Videos' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo - Left */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-display font-bold gradient-text hover:scale-105 transition-transform duration-200 whitespace-nowrap flex-shrink-0"
          >
            METALDRAGON
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 mx-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative font-medium text-[10px] xl:text-xs text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 whitespace-nowrap px-0.5 xl:px-1',
                  'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-amber-500 after:transition-all after:duration-200',
                  'hover:after:w-full',
                  pathname === link.href &&
                    'text-red-600 dark:text-red-400 after:w-full'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions - Right */}
          <div className="flex items-center gap-1 sm:gap-2 justify-end whitespace-nowrap flex-shrink-0">
            {/* Search Button - 터치 영역 44px */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Auth Buttons */}
            {!isMounted ? (
              // SSR: 항상 로그인 버튼 표시 (hydration mismatch 방지)
              <div className="hidden sm:flex items-center gap-1">
                <Link href="/auth/login">
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
                    로그인
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-2 py-1 text-xs rounded-md bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white shadow-sm transition-all whitespace-nowrap">
                    회원가입
                  </button>
                </Link>
              </div>
            ) : user ? (
              <div className="hidden sm:flex items-center gap-1 whitespace-nowrap">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </span>
                <Link href="/admin">
                  <button className="px-2 py-1 text-xs rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors">
                    관리자
                  </button>
                </Link>
                <button
                  onClick={() => {
                    // localStorage 세션 삭제
                    clearSession();
                    setUser(null);
                    alert('로그아웃되었습니다.');
                    router.push('/');
                  }}
                  className="px-2 py-1 text-xs rounded-md border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Link href="/auth/login">
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
                    로그인
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-2 py-1 text-xs rounded-md bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white shadow-sm transition-all whitespace-nowrap">
                    회원가입
                  </button>
                </Link>
              </div>
            )}

            <DarkModeToggle />

            {/* Mobile menu button - 터치 영역 44px */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - 카테고리별 그룹화 */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-4">
              {mobileMenuGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300',
                          'hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400',
                          'transition-all duration-200',
                          'active:scale-95 active:bg-red-100 dark:active:bg-red-950',
                          'min-h-[44px] flex items-center',
                          'touch-manipulation',
                          pathname === link.href &&
                            'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Mobile Admin Button - 터치 영역 44px 이상 */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {!isMounted ? (
                  // SSR: 항상 로그인 버튼 표시 (hydration mismatch 방지)
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-3 min-h-[44px] text-base rounded-lg bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 active:scale-95 text-white shadow-md transition-all touch-manipulation">
                      로그인
                    </button>
                  </Link>
                ) : user ? (
                  <>
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full px-4 py-3 min-h-[44px] text-base rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md transition-all touch-manipulation">
                        관리자
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        // localStorage 세션 삭제
                        clearSession();
                        setUser(null);
                        setMobileMenuOpen(false);
                        alert('로그아웃되었습니다.');
                        router.push('/');
                      }}
                      className="w-full px-4 py-3 min-h-[44px] text-base rounded-lg border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 active:scale-95 transition-all touch-manipulation"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-3 min-h-[44px] text-base rounded-lg bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 active:scale-95 text-white shadow-md transition-all touch-manipulation">
                      로그인
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
