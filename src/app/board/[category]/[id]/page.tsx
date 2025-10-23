/**
 * Board Post Detail Page - METALDRAGON Rock Community
 * 게시글 상세 페이지
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommentsSection } from '@/components/CommentsSection';
import { PostLikeButton } from '@/components/PostLikeButton';

interface BoardPostDetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function BoardPostDetailPage({ params }: BoardPostDetailPageProps) {
  const { category, id } = await params;
  const supabase = await createClient();

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  // 게시글 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('category', category)
    .single();

  if (postError || !post) {
    notFound();
  }

  // 사용자 정보 별도 조회
  let postWithUser = post;
  if (post.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .eq('id', post.user_id)
      .single();

    postWithUser = {
      ...post,
      users: userData || null
    };
  }

  // 조회수 증가 (서버 사이드)
  await supabase
    .from('posts')
    .update({ view_count: (postWithUser.view_count || 0) + 1 })
    .eq('id', id);

  // 삭제 액션
  async function deletePost() {
    'use server';
    const supabase = await createClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      redirect(`/board/${category}`);
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/board/${category}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            ← 목록으로
          </Link>
        </div>

        {/* Post Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            {/* Pinned Badge */}
            {postWithUser.is_pinned && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-white">
                  📌 공지
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              {postWithUser.title}
            </h1>

            {/* Meta Info */}
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-red-500">
                  {postWithUser.users?.username || '익명'}
                </span>
                <span>•</span>
                <span>{new Date(postWithUser.created_at).toLocaleString('ko-KR')}</span>
              </div>
              <span>👁️ {(postWithUser.view_count || 0) + 1}</span>
            </div>
          </div>

          {/* Images */}
          {postWithUser.image_urls && postWithUser.image_urls.length > 0 && (
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postWithUser.image_urls.map((url: string, index: number) => {
                  const fileExt = url.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(fileExt || '');
                  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'].includes(fileExt || '');

                  return (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {isImage ? (
                        <img
                          src={url}
                          alt={`${postWithUser.title} - 이미지 ${index + 1}`}
                          className="w-full h-auto object-contain"
                        />
                      ) : isVideo ? (
                        <video src={url} className="w-full h-auto" controls />
                      ) : (
                        <div className="w-full p-8 flex flex-col items-center justify-center">
                          <div className="text-6xl mb-4">📄</div>
                          <div className="text-sm text-center text-gray-600 dark:text-gray-400 break-all">
                            {url.split('/').pop()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            .{fileExt}
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            다운로드
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {postWithUser.content}
              </p>
            </div>
          </div>

          {/* Like Button */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <PostLikeButton postId={id} />
          </div>

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex gap-4">
                <Link
                  href={`/board/${category}/${id}/edit`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  ✏️ 수정
                </Link>
                <form action={deletePost}>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    onClick={(e) => {
                      if (!confirm('정말 삭제하시겠습니까?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    🗑️ 삭제
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentsSection postId={id} category="board" />
        </div>

        {/* Back to List Button */}
        <div className="mt-8 text-center">
          <Link
            href={`/board/${category}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 via-amber-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
