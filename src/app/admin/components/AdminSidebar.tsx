/**
 * Admin Sidebar with Tailwind CSS
 * 관리자 대시보드 사이드바 네비게이션
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { clearSession } from '@/lib/auth-client';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // localStorage 세션 삭제
      clearSession();
      console.log('✅ User logged out');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400'
        )}
      >
        {children}
      </Link>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-2">
      {children}
    </h3>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-teal-500 text-white shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 w-72 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 z-40',
        'lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
      {/* Logo */}
      <div className="text-2xl font-display font-bold gradient-text text-center pb-4 border-b border-gray-200 dark:border-gray-800">
        Rock Community Admin
      </div>

      {/* Dashboard */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Dashboard</SectionTitle>
        <NavItem href="/admin">Home</NavItem>
      </div>

      {/* Rock Content Management */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Rock Content</SectionTitle>
        <NavItem href="/admin/bands">Bands & Albums</NavItem>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col gap-2">
        <SectionTitle>Quick Links</SectionTitle>
        <NavItem href="/bands">View Bands</NavItem>
        <NavItem href="/albums">View Albums</NavItem>
        <NavItem href="/albums/legend">명반 100</NavItem>
        <NavItem href="/community">Community</NavItem>
        <NavItem href="/gallery">Gallery</NavItem>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-auto px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>
    </aside>
    </>
  );
}
