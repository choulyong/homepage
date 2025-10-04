/**
 * Admin Layout
 * 관리자 대시보드 레이아웃 (Protected)
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './components/AdminSidebar';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${tokens.colors.gradients.dark};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${tokens.spacing[8]};
  margin-left: 280px; /* Sidebar width */

  @media (max-width: 768px) {
    margin-left: 0;
    padding: ${tokens.spacing[4]};
  }
`;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    redirect('/login');
  }

  return (
    <AdminContainer>
      <AdminSidebar />
      <MainContent>{children}</MainContent>
    </AdminContainer>
  );
}
