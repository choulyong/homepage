/**
 * Admin Layout - Tailwind CSS
 * 관리자 대시보드 레이아웃 (Protected)
 */

'use client';

export const dynamic = 'force-dynamic';

import { AdminSidebar } from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware에서 이미 관리자 인증을 처리하므로 여기서는 레이아웃만 제공
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:ml-72 lg:p-8">
        {children}
      </main>
    </div>
  );
}
