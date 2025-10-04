/**
 * Admin Layout
 * 관리자 대시보드 레이아웃 (Protected)
 */

'use client';

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware에서 이미 관리자 인증을 처리하므로 여기서는 레이아웃만 제공
  return (
    <AdminContainer>
      <AdminSidebar />
      <MainContent>{children}</MainContent>
    </AdminContainer>
  );
}
