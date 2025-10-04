/**
 * Admin Sidebar
 * 관리자 대시보드 사이드바 네비게이션
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: ${tokens.colors.glass.medium};
  backdrop-filter: blur(20px);
  border-right: 1px solid ${tokens.colors.glass.light};
  padding: ${tokens.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[6]};

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
  }
`;

const Logo = styled.div`
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  padding-bottom: ${tokens.spacing[4]};
  border-bottom: 1px solid ${tokens.colors.glass.light};
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
`;

const SectionTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${tokens.spacing[2]};
`;

const NavItem = styled(Link)<{ $isActive?: boolean }>`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${(props) => (props.$isActive ? tokens.colors.white : tokens.colors.gray[300])};
  background: ${(props) => (props.$isActive ? tokens.colors.glass.medium : 'transparent')};
  transition: all ${tokens.transitions.base};
  cursor: pointer;

  &:hover {
    background: ${tokens.colors.glass.light};
    color: ${tokens.colors.white};
  }
`;

const LogoutButton = styled.button`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.danger};
  background: transparent;
  border: 1px solid ${tokens.colors.danger};
  transition: all ${tokens.transitions.base};
  cursor: pointer;
  margin-top: auto;

  &:hover {
    background: ${tokens.colors.danger};
    color: ${tokens.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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

  return (
    <SidebarContainer>
      <Logo>Metaldragon Admin</Logo>

      <NavSection>
        <SectionTitle>대시보드</SectionTitle>
        <NavItem href="/admin" $isActive={pathname === '/admin'}>
          홈
        </NavItem>
      </NavSection>

      <NavSection>
        <SectionTitle>콘텐츠 관리</SectionTitle>
        <NavItem href="/admin/about" $isActive={pathname === '/admin/about'}>
          About 편집
        </NavItem>
        <NavItem href="/admin/portfolio" $isActive={pathname === '/admin/portfolio'}>
          포트폴리오 관리
        </NavItem>
        <NavItem href="/admin/skills" $isActive={pathname === '/admin/skills'}>
          스킬 관리
        </NavItem>
      </NavSection>

      <NavSection>
        <SectionTitle>게시판 관리</SectionTitle>
        <NavItem href="/admin/posts" $isActive={pathname === '/admin/posts'}>
          게시글 관리
        </NavItem>
        <NavItem href="/admin/ai-study" $isActive={pathname === '/admin/ai-study'}>
          AI 스터디
        </NavItem>
        <NavItem href="/admin/bigdata-study" $isActive={pathname === '/admin/bigdata-study'}>
          빅데이터 스터디
        </NavItem>
        <NavItem href="/admin/ai-artwork" $isActive={pathname === '/admin/ai-artwork'}>
          AI 작품 갤러리
        </NavItem>
      </NavSection>

      <NavSection>
        <SectionTitle>기타</SectionTitle>
        <NavItem href="/admin/news" $isActive={pathname === '/admin/news'}>
          IT 뉴스 관리
        </NavItem>
        <NavItem href="/admin/youtube" $isActive={pathname === '/admin/youtube'}>
          YouTube 링크
        </NavItem>
        <NavItem href="/admin/finance" $isActive={pathname === '/admin/finance'}>
          가계부 관리
        </NavItem>
      </NavSection>

      <LogoutButton onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
      </LogoutButton>
    </SidebarContainer>
  );
}
