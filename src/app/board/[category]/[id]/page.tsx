/**
 * Post Detail Page with Tailwind CSS
 * 게시글 상세 페이지
 */

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { category, id } = await params;
  const supabase = await createClient();

  // 게시글 가져오기
  const { data: post } = await supabase
    .from('posts')
    .select(
      `
      *,
      users(username, avatar_url)
    `
    )
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', id);

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthor = user?.id === post.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        href={`/board/${category}`}
        className="inline-flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 mb-6 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
      >
        ← 목록으로
      </Link>

      {/* Post Content */}
      <Card padding="lg">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
            <span>작성자: {post.users?.username || '익명'}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            <span>•</span>
            <span>조회 {post.view_count || 0}</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {/* Action Buttons */}
        {isAuthor && (
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href={`/board/${category}/${id}/edit`}>
              <Button variant="outline">수정</Button>
            </Link>
            <Button variant="outline">삭제</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
