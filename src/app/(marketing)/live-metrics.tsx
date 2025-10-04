/**
 * Live Metrics Component
 * Based on HELP_GPT/code_snippets.md
 * Streams real-time data from Supabase
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';

const MetricsContainer = styled.div`
  display: flex;
  gap: ${tokens.spacing[6]};
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${tokens.spacing[6]};
`;

const MetricCard = styled.div`
  background: ${tokens.colors.glass.heavy};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${tokens.borderRadius.lg};
  padding: ${tokens.spacing[4]} ${tokens.spacing[6]};
  min-width: 150px;
  text-align: center;
  box-shadow: ${tokens.shadows.glass};
  color: white;
`;

const MetricValue = styled.div`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MetricLabel = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.8);
  margin-top: ${tokens.spacing[1]};
`;

const Timestamp = styled.time`
  font-size: ${tokens.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.6);
  font-family: ${tokens.typography.fontFamily.mono};
`;

export async function LiveMetrics() {
  const supabase = await createClient();

  // Fetch live metrics from Supabase
  const [
    { count: postCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <MetricsContainer>
      <MetricCard>
        <MetricValue>{postCount ?? 0}</MetricValue>
        <MetricLabel>게시물</MetricLabel>
      </MetricCard>

      <MetricCard>
        <MetricValue>{userCount ?? 0}</MetricValue>
        <MetricLabel>사용자</MetricLabel>
      </MetricCard>

      <MetricCard>
        <MetricValue>
          <Timestamp suppressHydrationWarning>
            {new Date().toLocaleTimeString('ko-KR')}
          </Timestamp>
        </MetricValue>
        <MetricLabel>실시간 업데이트</MetricLabel>
      </MetricCard>
    </MetricsContainer>
  );
}

// Skeleton for streaming
export function LiveMetricsSkeleton() {
  return (
    <MetricsContainer>
      {[1, 2, 3].map((i) => (
        <MetricCard key={i} style={{ opacity: 0.5 }}>
          <MetricValue>--</MetricValue>
          <MetricLabel>Loading...</MetricLabel>
        </MetricCard>
      ))}
    </MetricsContainer>
  );
}
