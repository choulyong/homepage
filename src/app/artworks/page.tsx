/**
 * AI Artworks Gallery Page
 * AI 작품 갤러리 (이미지, 영상, 음악, 문서)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

const GalleryContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${tokens.spacing[3]};
  margin-bottom: ${tokens.spacing[8]};
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${tokens.spacing[2]} ${tokens.spacing[5]};
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
  }
`;

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};
  grid-auto-rows: masonry;
`;

const ArtworkCard = styled(Card)`
  overflow: hidden;
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(240, 147, 251, 0.3);
  }
`;

const ArtworkMedia = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: ${tokens.colors.gray[800]};
  overflow: hidden;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaTypeBadge = styled.span<{ $type: string }>`
  position: absolute;
  top: ${tokens.spacing[3]};
  right: ${tokens.spacing[3]};
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  background: ${(props) =>
    props.$type === 'image'
      ? tokens.colors.primary[500]
      : props.$type === 'video'
        ? tokens.colors.danger
        : props.$type === 'audio'
          ? tokens.colors.success
          : tokens.colors.warning};
  color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const ArtworkInfo = styled.div`
  padding: ${tokens.spacing[5]};
`;

const ArtworkTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const ArtworkDescription = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
  margin-bottom: ${tokens.spacing[3]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArtworkMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.gray[500]};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[2]};
  margin-top: ${tokens.spacing[3]};
`;

const Tag = styled.span`
  padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
  background: ${tokens.colors.glass.light};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.gray[300]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

export default function ArtworksPage() {
  const [user, setUser] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 현재 사용자 확인
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // AI 작품 게시판의 게시글 가져오기 (ai_artwork 카테고리)
      const { data: artworksData } = await supabase
        .from('posts')
        .select('*')
        .eq('category', 'ai_artwork')
        .order('created_at', { ascending: false });

      setArtworks(artworksData || []);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <GalleryContainer>
        <EmptyState>
          <p>로딩 중...</p>
        </EmptyState>
      </GalleryContainer>
    );
  }

  return (
    <GalleryContainer>
      <Header>
        <Title>AI 작품 갤러리</Title>
        {user && (
          <Link href="/board/ai_artwork/new">
            <Button variant="primary">작품 업로드</Button>
          </Link>
        )}
      </Header>

      {artworks && artworks.length > 0 ? (
        <ArtworkGrid>
          {artworks.map((artwork) => (
            <Link key={artwork.id} href={`/board/ai_artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
              <ArtworkCard variant="glass">
                <ArtworkMedia>
                  {/* 썸네일 이미지가 있으면 표시, 없으면 기본 배경 */}
                  {artwork.image_url ? (
                    <img src={artwork.image_url} alt={artwork.title} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: tokens.colors.gradients.dark,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.gray[500],
                      }}
                    >
                      No Preview
                    </div>
                  )}
                  <MediaTypeBadge $type="image">AI ART</MediaTypeBadge>
                </ArtworkMedia>

                <ArtworkInfo>
                  <ArtworkTitle>{artwork.title}</ArtworkTitle>
                  <ArtworkDescription>
                    {artwork.content.substring(0, 100)}...
                  </ArtworkDescription>

                  <ArtworkMeta>
                    <span>{new Date(artwork.created_at).toLocaleDateString('ko-KR')}</span>
                    <span>조회 {artwork.view_count || 0}</span>
                  </ArtworkMeta>
                </ArtworkInfo>
              </ArtworkCard>
            </Link>
          ))}
        </ArtworkGrid>
      ) : (
        <EmptyState>
          <h2>아직 작품이 없습니다</h2>
          <p>첫 번째 AI 작품을 업로드해보세요!</p>
          {user && (
            <Link href="/board/ai_artwork/new">
              <Button variant="primary" style={{ marginTop: tokens.spacing[4] }}>
                작품 업로드
              </Button>
            </Link>
          )}
        </EmptyState>
      )}
    </GalleryContainer>
  );
}
