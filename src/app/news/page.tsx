/**
 * IT News Page
 * AI, 암호화폐 관련 IT 뉴스
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import Link from 'next/link';

const NewsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Header = styled.div`
  margin-bottom: ${tokens.spacing[8]};
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
  color: ${tokens.colors.gray[400]};
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  margin-bottom: ${tokens.spacing[8]};
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
  background: ${(props) =>
    props.$active ? tokens.colors.gradients.kinetic : tokens.colors.glass.light};
  color: ${tokens.colors.white};
  border: none;
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-2px);
    background: ${(props) =>
      props.$active ? tokens.colors.gradients.kinetic : tokens.colors.glass.medium};
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${tokens.spacing[6]};
`;

const NewsCard = styled(Card)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(240, 147, 251, 0.3);
  }
`;

const NewsImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${tokens.colors.gray[800]};
  overflow: hidden;

  img {
    object-fit: cover;
  }
`;

const NewsContent = styled.div`
  padding: ${tokens.spacing[6]};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NewsTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsDescription = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
  line-height: 1.6;
  margin-bottom: ${tokens.spacing[4]};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const NewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.gray[500]};
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  background: ${(props) =>
    props.$category === 'ai'
      ? tokens.colors.primary[500]
      : props.$category === 'crypto'
        ? tokens.colors.warning
        : tokens.colors.info};
  color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

export default async function NewsPage() {
  const supabase = await createClient();

  // 뉴스 가져오기
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50);

  return (
    <NewsContainer>
      <Header>
        <Title>IT 뉴스</Title>
        <Subtitle>AI, 암호화폐, 기술 트렌드 최신 뉴스</Subtitle>
      </Header>

      {/* 카테고리 탭은 추후 클라이언트 컴포넌트로 분리하여 필터링 기능 추가 */}

      {news && news.length > 0 ? (
        <NewsGrid>
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <NewsCard variant="glass">
                {item.image_url && (
                  <NewsImage>
                    <Image src={item.image_url} alt={item.title} fill />
                  </NewsImage>
                )}
                <NewsContent>
                  <NewsTitle>{item.title}</NewsTitle>
                  {item.description && <NewsDescription>{item.description}</NewsDescription>}
                  <NewsMeta>
                    <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                      {item.category && <CategoryBadge $category={item.category}>{item.category.toUpperCase()}</CategoryBadge>}
                      {item.source && <span>{item.source}</span>}
                    </div>
                    {item.published_at && (
                      <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
                    )}
                  </NewsMeta>
                </NewsContent>
              </NewsCard>
            </a>
          ))}
        </NewsGrid>
      ) : (
        <EmptyState>
          <h2>아직 뉴스가 없습니다</h2>
          <p>관리자가 뉴스를 추가하면 여기에 표시됩니다.</p>
        </EmptyState>
      )}
    </NewsContainer>
  );
}
