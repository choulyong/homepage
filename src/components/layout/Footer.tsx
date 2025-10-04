/**
 * Footer Component
 */

'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const FooterContainer = styled.footer`
  background: ${tokens.colors.gray[900]};
  color: ${tokens.colors.gray[300]};
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${tokens.spacing[8]};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const FooterTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: white;
  margin: 0;
`;

const FooterLink = styled(Link)`
  color: ${tokens.colors.gray[400]};
  text-decoration: none;
  transition: color ${tokens.transitions.base};

  &:hover {
    color: ${tokens.colors.primary[400]};
  }
`;

const FooterBottom = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  margin-top: ${tokens.spacing[8]};
  padding-top: ${tokens.spacing[6]};
  border-top: 1px solid ${tokens.colors.gray[800]};
  text-align: center;
  color: ${tokens.colors.gray[500]};
  font-size: ${tokens.typography.fontSize.sm};
`;

export function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>metaldragon</FooterTitle>
          <p>현대적인 개인 포털 플랫폼</p>
          <p>AI, 학습, 창작물을 하나의 공간에서</p>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Boards</FooterTitle>
          <FooterLink href="/board/ai_study">AI 스터디</FooterLink>
          <FooterLink href="/board/bigdata_study">빅데이터처리기사</FooterLink>
          <FooterLink href="/board/free_board">자유게시판</FooterLink>
          <FooterLink href="/artworks">AI 작품 갤러리</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Features</FooterTitle>
          <FooterLink href="/schedule">일정 관리</FooterLink>
          <FooterLink href="/budget">가계부</FooterLink>
          <FooterLink href="/news">IT 뉴스</FooterLink>
          <FooterLink href="/youtube">유튜브 커버</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Legal</FooterTitle>
          <FooterLink href="/privacy">개인정보 처리방침</FooterLink>
          <FooterLink href="/terms">이용약관</FooterLink>
          <FooterLink href="/contact">문의하기</FooterLink>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>© 2025 metaldragon.co.kr. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
}
