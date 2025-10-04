/**
 * New Post Page
 * 새 게시글 작성 페이지
 */

'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const NewPostContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[8]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[6]};
`;

const FormCard = styled(Card)`
  padding: ${tokens.spacing[6]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
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
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]}20;
  }
`;

const TextArea = styled.textarea`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 400px;
  resize: vertical;
  font-family: inherit;
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]}20;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  justify-content: flex-end;
`;

const ErrorMessage = styled.div`
  padding: ${tokens.spacing[4]};
  background: ${tokens.colors.danger}15;
  border: 1px solid ${tokens.colors.danger};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.danger};
`;

const CATEGORY_LABELS: Record<string, string> = {
  ai_study: 'AI 스터디',
  bigdata_study: '빅데이터 엔지니어 자격증 스터디',
  free_board: '자유게시판',
  ai_artwork: 'AI 작품 갤러리',
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function NewPostPage({ params }: PageProps) {
  const { category } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 현재 사용자 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }

      // 게시글 작성
      const { error: insertError } = await supabase.from('posts').insert({
        title,
        content,
        category_id: category,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      // 게시판으로 이동
      router.push(`/board/${category}`);
    } catch (err: any) {
      setError(err.message || '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NewPostContainer>
      <Title>{CATEGORY_LABELS[category]} - 글쓰기</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormCard variant="glass">
          <FormGroup>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="제목을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">내용 *</Label>
            <TextArea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="내용을 입력하세요"
            />
          </FormGroup>
        </FormCard>

        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/board/${category}`)}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '작성 중...' : '작성 완료'}
          </Button>
        </ButtonGroup>
      </Form>
    </NewPostContainer>
  );
}
