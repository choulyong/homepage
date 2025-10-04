/**
 * YouTube Cover Page
 * YouTube 커버 영상 목록
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

const YouTubeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
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
  margin-bottom: ${tokens.spacing[8]};
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${tokens.spacing[6]};
`;

const VideoCard = styled(Card)`
  overflow: hidden;
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(240, 147, 251, 0.3);
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: ${tokens.colors.gray[800]};
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 48px;
  background: rgba(255, 0, 0, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${tokens.transitions.base};

  &::before {
    content: '';
    width: 0;
    height: 0;
    border-left: 20px solid white;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    margin-left: 4px;
  }

  ${VideoCard}:hover & {
    background: rgb(255, 0, 0);
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const VideoInfo = styled.div`
  padding: ${tokens.spacing[4]};
`;

const VideoTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoMeta = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

export default async function YouTubePage() {
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('published_at', { ascending: false });

  return (
    <YouTubeContainer>
      <Title>YouTube 커버 영상</Title>
      <Subtitle>노래 커버와 연주 영상을 공유합니다</Subtitle>

      {videos && videos.length > 0 ? (
        <VideoGrid>
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <VideoCard variant="glass">
                <VideoThumbnail>
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: tokens.colors.gradients.dark,
                      }}
                    />
                  )}
                  <PlayButton />
                </VideoThumbnail>
                <VideoInfo>
                  <VideoTitle>{video.title}</VideoTitle>
                  {video.published_at && (
                    <VideoMeta>
                      {new Date(video.published_at).toLocaleDateString('ko-KR')}
                    </VideoMeta>
                  )}
                </VideoInfo>
              </VideoCard>
            </a>
          ))}
        </VideoGrid>
      ) : (
        <EmptyState>
          <h2>아직 영상이 없습니다</h2>
          <p>곧 멋진 커버 영상을 업로드할 예정입니다!</p>
        </EmptyState>
      )}
    </YouTubeContainer>
  );
}
