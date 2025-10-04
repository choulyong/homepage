/**
 * Admin Dashboard Home
 * 관리자 대시보드 메인 페이지
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${tokens.typography.fontSize.lg};
  color: ${tokens.colors.gray[300]};
  margin-bottom: ${tokens.spacing[8]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[8]};
`;

const StatsCard = styled(Card)`
  padding: ${tokens.spacing[6]};
`;

const StatValue = styled.div`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[2]};
`;

const StatLabel = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const QuickActionsSection = styled.section`
  margin-top: ${tokens.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[4]};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${tokens.spacing[4]};
`;

const ActionCard = styled(Link)`
  display: block;
  padding: ${tokens.spacing[5]};
  background: ${tokens.colors.glass.medium};
  backdrop-filter: blur(20px);
  border: 1px solid ${tokens.colors.glass.light};
  border-radius: ${tokens.borderRadius.lg};
  transition: all ${tokens.transitions.base};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: ${tokens.colors.primary[400]};
    box-shadow: 0 8px 24px rgba(240, 147, 251, 0.2);
  }
`;

const ActionTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const ActionDescription = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[300]};
`;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 통계 데이터 가져오기 (예시)
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  return (
    <DashboardContainer>
      <Title>환영합니다, {user?.email}!</Title>
      <Subtitle>Metaldragon Control Room에서 모든 콘텐츠를 관리하세요</Subtitle>

      <Grid>
        <StatsCard variant="glass">
          <StatValue>{postsCount || 0}</StatValue>
          <StatLabel>총 게시글</StatLabel>
        </StatsCard>

        <StatsCard variant="glass">
          <StatValue>{usersCount || 0}</StatValue>
          <StatLabel>등록된 사용자</StatLabel>
        </StatsCard>

        <StatsCard variant="glass">
          <StatValue>0</StatValue>
          <StatLabel>AI 작품</StatLabel>
        </StatsCard>

        <StatsCard variant="glass">
          <StatValue>실시간</StatValue>
          <StatLabel>시스템 상태</StatLabel>
        </StatsCard>
      </Grid>

      <QuickActionsSection>
        <SectionTitle>빠른 작업</SectionTitle>
        <ActionGrid>
          <ActionCard href="/admin/about">
            <ActionTitle>프로필 편집</ActionTitle>
            <ActionDescription>
              자기소개, 사진, 포트폴리오 정보를 수정하세요
            </ActionDescription>
          </ActionCard>

          <ActionCard href="/admin/posts">
            <ActionTitle>새 게시글 작성</ActionTitle>
            <ActionDescription>
              AI 스터디, 빅데이터 스터디, 자유게시판에 글을 작성하세요
            </ActionDescription>
          </ActionCard>

          <ActionCard href="/admin/ai-artwork">
            <ActionTitle>AI 작품 업로드</ActionTitle>
            <ActionDescription>
              AI로 생성한 이미지, 영상, 음악을 업로드하세요
            </ActionDescription>
          </ActionCard>

          <ActionCard href="/admin/news">
            <ActionTitle>IT 뉴스 관리</ActionTitle>
            <ActionDescription>
              AI, 암호화폐 관련 뉴스를 추가하거나 편집하세요
            </ActionDescription>
          </ActionCard>

          <ActionCard href="/admin/finance">
            <ActionTitle>가계부 입력</ActionTitle>
            <ActionDescription>
              수입/지출 내역을 기록하고 통계를 확인하세요
            </ActionDescription>
          </ActionCard>

          <ActionCard href="/admin/youtube">
            <ActionTitle>YouTube 링크</ActionTitle>
            <ActionDescription>
              커버 영상 링크를 추가하거나 관리하세요
            </ActionDescription>
          </ActionCard>
        </ActionGrid>
      </QuickActionsSection>
    </DashboardContainer>
  );
}
