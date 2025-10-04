/**
 * Marketing Page (Hero) with PPR
 * Based on HELP_GPT/code_snippets.md
 * Implements Partial Pre-Rendering with streaming metrics
 */

import { Suspense } from 'react';
import { unstable_noStore } from 'next/cache';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { View } from '@/components/ui/View';
import { LiveMetrics, LiveMetricsSkeleton } from './live-metrics';
import Link from 'next/link';

// Enable PPR for this page
export const experimental_ppr = true;

const HeroSection = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
  background: ${tokens.colors.gradients.dark};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${tokens.colors.gradients.kinetic};
    opacity: 0.1;
    animation: gradientShift 8s ease infinite;
  }

  @keyframes gradientShift {
    0%, 100% {
      transform: translateX(0) translateY(0);
    }
    50% {
      transform: translateX(10%) translateY(10%);
    }
  }
`;

const HeroContent = styled.div`
  max-width: 900px;
  text-align: center;
  z-index: 1;
`;

const Title = styled.h1`
  font-family: ${tokens.typography.fontFamily.display};
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: ${tokens.typography.fontWeight.extrabold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 ${tokens.spacing[6]};
  line-height: 1.2;

  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Subtitle = styled.p`
  font-size: ${tokens.typography.fontSize.xl};
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 ${tokens.spacing[8]};
  line-height: ${tokens.typography.lineHeight.relaxed};

  animation: fadeInUp 0.8s ease-out 0.2s both;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: ${tokens.spacing[12]};

  animation: fadeInUp 0.8s ease-out 0.4s both;
`;

const FeaturesSection = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};
  margin-top: ${tokens.spacing[8]};
`;

const FeatureCard = styled.div`
  background: ${tokens.colors.glass.medium};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${tokens.borderRadius.xl};
  padding: ${tokens.spacing[8]};
  box-shadow: ${tokens.shadows.glass};
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${tokens.shadows.glow};
  }
`;

const FeatureIcon = styled.div`
  font-size: ${tokens.typography.fontSize['4xl']};
  margin-bottom: ${tokens.spacing[4]};
`;

const FeatureTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.xl};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.gray[900]};
  margin: 0 0 ${tokens.spacing[2]};
`;

const FeatureDescription = styled.p`
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.gray[600]};
  line-height: ${tokens.typography.lineHeight.relaxed};
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  text-align: center;
  color: ${tokens.colors.gray[900]};
  margin: 0;
`;

export default async function MarketingPage() {
  unstable_noStore();

  return (
    <main>
      <HeroSection>
        <HeroContent>
          <Title>Metaldragon Control Room</Title>
          <Subtitle>
            실시간 학습, 재무 관리, AI 창작물을 하나의 운영 패널에서
          </Subtitle>

          <CTAButtons>
            <Link href="/board/ai_study">
              <Button variant="glass" size="lg">
                스터디 시작하기
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                더 알아보기
              </Button>
            </Link>
          </CTAButtons>

          {/* Streaming Metrics with Suspense */}
          <Suspense fallback={<LiveMetricsSkeleton />}>
            <LiveMetrics />
          </Suspense>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>핵심 기능</SectionTitle>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>📚</FeatureIcon>
            <FeatureTitle>스터디 게시판</FeatureTitle>
            <FeatureDescription>
              AI, 빅데이터처리기사 등 다양한 주제의 스터디 자료를 공유하고 토론하세요.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📰</FeatureIcon>
            <FeatureTitle>IT 뉴스 자동 업데이트</FeatureTitle>
            <FeatureDescription>
              AI와 코인 관련 최신 뉴스를 매일 자동으로 받아보세요.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>스마트 가계부</FeatureTitle>
            <FeatureDescription>
              문자 메시지 연동으로 자동으로 지출을 기록하고 통계를 확인하세요.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🎨</FeatureIcon>
            <FeatureTitle>AI 작품 갤러리</FeatureTitle>
            <FeatureDescription>
              AI로 생성한 이미지, 동영상, 음악 등의 창작물을 아카이빙하세요.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📅</FeatureIcon>
            <FeatureTitle>일정 관리</FeatureTitle>
            <FeatureDescription>
              캘린더에서 일정을 관리하고 알림을 받아보세요.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🎵</FeatureIcon>
            <FeatureTitle>유튜브 커버 링크</FeatureTitle>
            <FeatureDescription>
              유튜브 커버 영상을 자동으로 수집하고 정리하세요.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
    </main>
  );
}
