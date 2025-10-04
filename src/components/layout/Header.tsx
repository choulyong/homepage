/**
 * Header Component
 * Glassmorphism navigation with metaldragon branding
 */

'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { View } from '@/components/ui/View';
import { Button } from '@/components/ui/Button';

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: ${tokens.zIndex.sticky};
  background: ${tokens.colors.glass.heavy};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: ${tokens.shadows.glass};
`;

const Nav = styled.nav`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${tokens.spacing[4]} ${tokens.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-family: ${tokens.typography.fontFamily.display};
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: scale(1.05);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${tokens.spacing[6]};
  align-items: center;

  @media (max-width: ${tokens.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${tokens.colors.gray[700]};
  text-decoration: none;
  font-weight: ${tokens.typography.fontWeight.medium};
  transition: all ${tokens.transitions.base};
  position: relative;

  &:hover {
    color: ${tokens.colors.primary[600]};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${tokens.colors.gradients.kinetic};
    transition: width ${tokens.transitions.base};
  }

  &:hover::after {
    width: 100%;
  }
`;

export function Header() {
  return (
    <HeaderContainer>
      <Nav>
        <Logo href="/">metaldragon</Logo>

        <NavLinks>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/schedule">일정</NavLink>
          <NavLink href="/board/ai_study">AI 스터디</NavLink>
          <NavLink href="/board/bigdata_study">빅데이터</NavLink>
          <NavLink href="/news">IT News</NavLink>
          <NavLink href="/artworks">AI 작품</NavLink>
          <NavLink href="/youtube">YouTube</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </NavLinks>

        <View flex gap={2}>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
        </View>
      </Nav>
    </HeaderContainer>
  );
}
