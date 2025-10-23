/**
 * Post Detail Page with Tailwind CSS
 * 게시글 상세 페이지
 */

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PostLikeButton } from '@/components/PostLikeButton';
import { CommentsSection } from '@/components/CommentsSection';
import { PostContent } from '@/components/board/PostContent';
import { FileViewer } from '@/components/board/FileViewer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { category, id } = await params;
  const supabase = await createClient();

  // 게시글 가져오기 (외래 키 없이 별도 쿼리로 처리)
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  console.log('📄 게시글 조회:', { id, post: post ? '존재함' : '없음', error: postError });

  if (!post) {
    console.log('❌ 게시글 없음 - 404 반환');
    notFound();
  }

  // 사용자 정보 별도 조회
  let postWithUser = post;
  if (post.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', post.user_id)
      .single();

    postWithUser = {
      ...post,
      users: userData || null
    };

    console.log('👤 사용자 정보:', { userId: post.user_id, username: userData?.username });
  }

  // 조회수 증가
  await supabase
    .from('posts')
    .update({ view_count: (postWithUser.view_count || 0) + 1 })
    .eq('id', id);

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthor = user?.id === postWithUser.user_id;

  // 관리자 확인
  let isAdmin = false;
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = userData?.role === 'admin';
  }

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
            {postWithUser.title}
          </h1>

          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-100">
            <span>작성자: {postWithUser.users?.username || '익명'}</span>
            <span>•</span>
            <span>{new Date(postWithUser.created_at).toLocaleDateString('ko-KR')}</span>
            <span>•</span>
            <span>조회 {postWithUser.view_count || 0}</span>
          </div>
        </div>

        {/* Files (Images, Videos, Documents, etc.) */}
        {postWithUser.image_urls && postWithUser.image_urls.length > 0 && (
          <FileViewer fileUrls={postWithUser.image_urls} />
        )}

        {/* Content */}
        <PostContent post={postWithUser} isAdmin={isAdmin} />

        {/* Like Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <PostLikeButton postId={id} />
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

        {/* Comments Section */}
        <CommentsSection targetType="post" targetId={id} />
      </Card>
    </div>
  );
}
