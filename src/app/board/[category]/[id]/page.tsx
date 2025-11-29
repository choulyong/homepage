/**
 * Board Post Detail Page - METALDRAGON Rock Community
 * 게시글 상세 페이지 (로컬 PostgreSQL + Cookie 인증)
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma';
import { cookies } from 'next/headers';

interface BoardPostDetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function BoardPostDetailPage({ params }: BoardPostDetailPageProps) {
  const { category, id } = await params;
  const prisma = new PrismaClient();

  // Cookie 기반 사용자 확인
  const cookieStore = await cookies();
  console.log('🍪 [게시글 상세] 전체 쿠키 목록:', cookieStore.getAll());

  const session = cookieStore.get('session');
  console.log('🔍 [게시글 상세] session 쿠키:', session);

  let currentUser = null;

  if (session) {
    try {
      const decoded = Buffer.from(session.value, 'base64').toString('utf-8');
      console.log('🔓 [게시글 상세] 세션 디코딩:', decoded);
      const parts = decoded.split(':');
      const userId = parts[0];
      const username = parts[1];
      const isAdminStr = parts[2] || 'false';
      const isAdmin = isAdminStr === 'true';

      if (userId && username) {
        currentUser = { id: userId, username, isAdmin };
        console.log('✅ [게시글 상세] 파싱된 사용자:', currentUser);
      }
    } catch (e) {
      console.error('❌ [게시글 상세] 세션 파싱 에러:', e);
    }
  } else {
    console.log('❌ [게시글 상세] 세션 쿠키 없음 - 로그인 필요');
  }

  try {
    // 게시글 조회
    const post = await prisma.boardPost.findFirst({
      where: {
        id,
        category
      }
    });

    if (!post) {
      await prisma.$disconnect();
      notFound();
    }

    // 조회수 증가
    await prisma.boardPost.update({
      where: { id },
      data: { views: post.views + 1 }
    });

    const postWithViews = { ...post, views: post.views + 1 };

    // 작성자 확인 또는 관리자 확인
    const isAuthor = currentUser && currentUser.id === post.user_id;
    const isAdmin = currentUser && currentUser.isAdmin;
    const canEdit = isAuthor || isAdmin;

    // 디버깅: 사용자 정보 출력
    console.log('=== 게시글 상세 페이지 디버깅 ===');
    console.log('currentUser:', currentUser);
    console.log('post.user_id:', post.user_id);
    console.log('isAuthor:', isAuthor);
    console.log('isAdmin:', isAdmin);
    console.log('canEdit:', canEdit);

    // 삭제 액션
    async function deletePost() {
      'use server';
      const prisma = new PrismaClient();
      await prisma.boardPost.delete({ where: { id } });
      await prisma.$disconnect();
      redirect(`/board/${category}`);
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
            {postWithViews.is_pinned && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-white">
                  📌 공지
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              {postWithViews.title}
            </h1>

            {/* Meta Info */}
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-red-500">
                  {postWithViews.author}
                </span>
                <span>•</span>
                <span>{new Date(postWithViews.created_at).toLocaleString('ko-KR')}</span>
              </div>
              <span>👁️ {postWithViews.views}</span>
            </div>
          </div>

          {/* Images */}
          {postWithViews.image_urls && postWithViews.image_urls.length > 0 && (
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postWithViews.image_urls.map((url: string, index: number) => {
                  const fileExt = url.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(fileExt || '');
                  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'].includes(fileExt || '');

                  return (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {isImage ? (
                        <img
                          src={url}
                          alt={`${postWithViews.title} - 이미지 ${index + 1}`}
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
                {postWithViews.content}
              </p>
            </div>
          </div>

          {/* Author/Admin Action Buttons */}
          {canEdit && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              {isAdmin && !isAuthor && (
                <div className="mb-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-400 dark:border-amber-600 rounded-lg">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    🛡️ 관리자 권한으로 수정/삭제 가능
                  </span>
                </div>
              )}
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
                  >
                    🗑️ 삭제
                  </button>
                </form>
              </div>
            </div>
          )}
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

    await prisma.$disconnect();
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    await prisma.$disconnect();
    notFound();
  }
}
