/**
 * Admin News Management
 * IT 뉴스 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const NewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
  margin-bottom: ${tokens.spacing[4]};
`;

const Label = styled.label`
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[300]};
`;

const Input = styled.input`
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
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const Select = styled.select`
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

const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const NewsItem = styled(Card)`
  padding: ${tokens.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NewsInfo = styled.div`
  flex: 1;
`;

const NewsTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const NewsUrl = styled.a`
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

export default function AdminNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [news, setNews] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    source: '',
    imageUrl: '',
    category: 'tech',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  // 뉴스 목록 로드
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20);

    if (data) setNews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('news').insert({
        title: formData.title,
        description: formData.description,
        url: formData.url,
        source: formData.source,
        image_url: formData.imageUrl,
        category: formData.category,
        published_at: formData.publishedAt,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '뉴스가 추가되었습니다!' });
      setFormData({
        title: '',
        description: '',
        url: '',
        source: '',
        imageUrl: '',
        category: 'tech',
        publishedAt: new Date().toISOString().split('T')[0],
      });

      loadNews();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '뉴스 추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 뉴스를 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '뉴스가 삭제되었습니다.' });
      loadNews();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  return (
    <NewsContainer>
      <Header>
        <Title>IT 뉴스 관리</Title>
      </Header>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormCard variant="glass">
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[4], color: tokens.colors.white }}>
            새 뉴스 추가
          </h2>

          <FormGroup>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">설명</Label>
            <TextArea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="url">뉴스 URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="source">출처</Label>
            <Input
              id="source"
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="TechCrunch, The Verge..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">카테고리</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="ai">AI</option>
              <option value="crypto">Crypto</option>
              <option value="tech">Tech</option>
            </Select>
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
            {loading ? '추가 중...' : '뉴스 추가'}
          </Button>
        </FormCard>
      </Form>

      <NewsList>
        <h2 style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.white, marginBottom: tokens.spacing[4] }}>
          최근 뉴스
        </h2>
        {news.map((item) => (
          <NewsItem key={item.id} variant="glass">
            <NewsInfo>
              <NewsTitle>{item.title}</NewsTitle>
              <NewsUrl href={item.url} target="_blank" rel="noopener noreferrer">
                {item.url}
              </NewsUrl>
            </NewsInfo>
            <Button variant="outline" onClick={() => handleDelete(item.id)}>
              삭제
            </Button>
          </NewsItem>
        ))}
      </NewsList>
    </NewsContainer>
  );
}
