/**
 * Admin YouTube Management
 * YouTube 커버 영상 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { crawlYouTubeVideos } from '@/app/actions/crawl';

const YouTubeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  margin-bottom: ${tokens.spacing[8]};
`;

const FormCard = styled(Card)`
  padding: ${tokens.spacing[6]};
`;

const FormGroup = styled.div`
  margin-bottom: ${tokens.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[300]};
  margin-bottom: ${tokens.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const VideoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const VideoItem = styled(Card)`
  padding: ${tokens.spacing[4]};
  display: flex;
  gap: ${tokens.spacing[4]};
  align-items: center;
`;

const VideoThumbnail = styled.img`
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: ${tokens.borderRadius.md};
`;

const VideoInfo = styled.div`
  flex: 1;
`;

const VideoTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const VideoUrl = styled.a`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.primary[400]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  margin-bottom: ${tokens.spacing[4]};
  background: ${(props) =>
    props.$type === 'success' ? `${tokens.colors.success}15` : `${tokens.colors.danger}15`};
  border: 1px solid
    ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
  color: ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
`;

export default function AdminYouTubePage() {
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    description: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20);

    if (data) setVideos(data);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // YouTube ID 추출
      const videoId = extractYouTubeId(formData.youtubeUrl);
      if (!videoId) {
        throw new Error('유효한 YouTube URL이 아닙니다');
      }

      // 썸네일 URL 자동 생성 (입력하지 않은 경우)
      const thumbnailUrl =
        formData.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const { error } = await supabase.from('youtube_videos').insert({
        title: formData.title,
        youtube_url: formData.youtubeUrl,
        thumbnail_url: thumbnailUrl,
        description: formData.description,
        published_at: formData.publishedAt,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'YouTube 영상이 추가되었습니다!' });
      setFormData({
        title: '',
        youtubeUrl: '',
        thumbnailUrl: '',
        description: '',
        publishedAt: new Date().toISOString().split('T')[0],
      });

      loadVideos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 영상을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('youtube_videos').delete().eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '영상이 삭제되었습니다.' });
      loadVideos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  const handleCrawl = async () => {
    setCrawling(true);
    setMessage(null);

    try {
      const result = await crawlYouTubeVideos();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadVideos();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '크롤링에 실패했습니다.' });
    } finally {
      setCrawling(false);
    }
  };

  return (
    <YouTubeContainer>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title>YouTube 커버 영상 관리</Title>
          <Button variant="primary" onClick={handleCrawl} disabled={crawling}>
            {crawling ? '크롤링 중...' : '🔄 채널에서 자동 가져오기'}
          </Button>
        </div>
      </Header>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormCard variant="glass">
          <h2
            style={{
              fontSize: tokens.typography.fontSize.xl,
              marginBottom: tokens.spacing[4],
              color: tokens.colors.white,
            }}
          >
            새 영상 추가
          </h2>

          <FormGroup>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="커버 영상 제목"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="youtubeUrl">YouTube URL *</Label>
            <Input
              id="youtubeUrl"
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="thumbnailUrl">썸네일 URL (선택사항 - 자동 생성됨)</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://img.youtube.com/vi/..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">설명</Label>
            <TextArea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="영상에 대한 간단한 설명"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="publishedAt">발행일</Label>
            <Input
              id="publishedAt"
              type="date"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
            />
          </FormGroup>

          <Button type="submit" variant="primary" disabled={loading} fullWidth>
            {loading ? '추가 중...' : '영상 추가'}
          </Button>
        </FormCard>
      </Form>

      <VideoList>
        <h2
          style={{
            fontSize: tokens.typography.fontSize.xl,
            color: tokens.colors.white,
            marginBottom: tokens.spacing[4],
          }}
        >
          등록된 영상
        </h2>
        {videos.map((video) => (
          <VideoItem key={video.id} variant="glass">
            {video.thumbnail_url && (
              <VideoThumbnail src={video.thumbnail_url} alt={video.title} />
            )}
            <VideoInfo>
              <VideoTitle>{video.title}</VideoTitle>
              <VideoUrl href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                {video.youtube_url}
              </VideoUrl>
            </VideoInfo>
            <Button variant="outline" onClick={() => handleDelete(video.id)}>
              삭제
            </Button>
          </VideoItem>
        ))}
      </VideoList>
    </YouTubeContainer>
  );
}
