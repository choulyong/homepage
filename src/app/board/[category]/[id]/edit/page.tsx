/**
 * Edit Post Page with Tailwind CSS
 * 게시글 수정 페이지
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createClient } from '@/lib/supabase/client';

const CATEGORY_LABELS: Record<string, string> = {
  ai_study: 'AI 스터디',
  bigdata_study: '빅데이터 엔지니어 자격증 스터디',
  free_board: '자유게시판',
  ai_artwork: 'AI 작품 갤러리',
};

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const { category, id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        const supabase = createClient();

        // 현재 사용자 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        // 게시글 가져오기
        const { data: post, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (postError || !post) {
          setError('게시글을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        // 작성자 확인
        if (post.user_id !== user.id) {
          setError('수정 권한이 없습니다.');
          setLoading(false);
          return;
        }

        // 초기값 설정
        setTitle(post.title || '');
        setContent(post.content || '');
        setLoading(false);
      } catch (err: any) {
        setError(err.message || '게시글을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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

      // 게시글 수정
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // 작성자만 수정 가능

      if (updateError) throw updateError;

      // 게시글 상세 페이지로 이동
      router.push(`/board/${category}/${id}`);
    } catch (err: any) {
      setError(err.message || '게시글 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
        <div className="mt-6">
          <Button variant="outline" onClick={() => router.push(`/board/${category}`)}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold gradient-text mb-8">
        {CATEGORY_LABELS[category]} - 글 수정
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
            onClick={() => router.push(`/board/${category}/${id}`)}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </div>
  );
}
