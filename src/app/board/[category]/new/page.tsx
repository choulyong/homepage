/**
 * New Post Page with Tailwind CSS
 * 새 게시글 작성 페이지
 */

'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold gradient-text mb-8">
        {CATEGORY_LABELS[category]} - 글쓰기
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="lg">
          <div className="space-y-6">
            <Input
              id="title"
              label="제목"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="제목을 입력하세요"
              fullWidth
            />

            <Textarea
              id="content"
              label="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="내용을 입력하세요"
              rows={16}
              fullWidth
            />
          </div>
        </Card>

        <div className="flex gap-4 justify-end">
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
        </div>
      </form>
    </div>
  );
}
