/**
 * Admin Sidebar with Tailwind CSS
 * 관리자 대시보드 사이드바 네비게이션
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
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
    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </h3>
  );

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto md:relative md:w-auto">
      {/* Logo */}
      <div className="text-2xl font-display font-bold gradient-text text-center pb-4 border-b border-gray-200 dark:border-gray-800">
        Metaldragon Admin
      </div>

      {/* Dashboard */}
      <div className="flex flex-col gap-2">
        <SectionTitle>대시보드</SectionTitle>
        <NavItem href="/admin">홈</NavItem>
      </div>

      {/* Content Management */}
      <div className="flex flex-col gap-2">
        <SectionTitle>콘텐츠 관리</SectionTitle>
        <NavItem href="/admin/about">About 편집</NavItem>
        <NavItem href="/admin/portfolio">포트폴리오 관리</NavItem>
        <NavItem href="/admin/skills">스킬 관리</NavItem>
      </div>

      {/* Board Management */}
      <div className="flex flex-col gap-2">
        <SectionTitle>게시판 관리</SectionTitle>
        <NavItem href="/admin/posts">게시글 관리</NavItem>
        <NavItem href="/admin/ai-study">AI 스터디</NavItem>
        <NavItem href="/admin/bigdata-study">빅데이터 스터디</NavItem>
        <NavItem href="/admin/ai-artwork">AI 작품 갤러리</NavItem>
      </div>

      {/* Other */}
      <div className="flex flex-col gap-2">
        <SectionTitle>기타</SectionTitle>
        <NavItem href="/admin/news">IT 뉴스 관리</NavItem>
        <NavItem href="/admin/youtube">YouTube 링크</NavItem>
        <NavItem href="/admin/finance">가계부 관리</NavItem>
        <NavItem href="/admin/contacts">문의 내역</NavItem>
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
  );
}
