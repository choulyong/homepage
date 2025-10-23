/**
 * Header Component with Tailwind CSS
 * Modern navigation with teal-indigo gradient and dark mode support
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SearchModal } from '@/components/SearchModal';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        // If refresh token is invalid, clear the session silently
        if (error?.message?.includes('refresh_token_not_found') ||
            error?.message?.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        setUser(user);
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/bands', label: 'Bands' },
    { href: '/albums', label: 'Albums' },
    { href: '/concerts', label: 'Concerts' },
    { href: '/community', label: 'Community' },
    { href: '/news', label: 'News' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/rock-art', label: 'Rock Art' },
    { href: '/videos', label: 'Videos' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-display font-bold gradient-text hover:scale-105 transition-transform duration-200 mr-12"
          >
            METALDRAGON
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative font-medium text-sm xl:text-base text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 whitespace-nowrap',
                  'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-teal-500 after:to-indigo-500 after:transition-all after:duration-200',
                  'hover:after:w-full',
                  pathname === link.href &&
                    'text-teal-600 dark:text-teal-400 after:w-full'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

            {/* Admin / Logout Button */}
            {!isMounted ? (
              // SSR: 항상 로그인 버튼 표시 (hydration mismatch 방지)
              <Link href="/admin/login" className="hidden sm:block">
                <button className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-md transition-all whitespace-nowrap">
                  관리자
                </button>
              </Link>
            ) : user ? (
              <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
                <Link href="/admin">
                  <button className="px-3 py-1.5 text-sm rounded-md bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-colors">
                    관리자
                  </button>
                </Link>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    setUser(null);
                    router.push('/');
                  }}
                  className="px-3 py-1.5 text-sm rounded-md border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/admin/login" className="hidden sm:block">
                <button className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-md transition-all whitespace-nowrap">
                  관리자
                </button>
              </Link>
            )}

            <DarkModeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-colors',
                    pathname === link.href &&
                      'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Admin Button */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {!isMounted ? (
                  // SSR: 항상 로그인 버튼 표시 (hydration mismatch 방지)
                  <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-base rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-md">
                      관리자 로그인
                    </button>
                  </Link>
                ) : user ? (
                  <>
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full px-4 py-2 text-base rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-md">
                        관리자
                      </button>
                    </Link>
                    <button
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        setUser(null);
                        setMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full px-4 py-2 text-base rounded-lg border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-base rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-md">
                      관리자 로그인
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
