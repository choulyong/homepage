/**
 * Board Category Page - METALDRAGON Rock Community
 * 카테고리별 게시글 목록
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface BoardCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Rock Community 게시판 카테고리
const CATEGORIES: Record<string, { name: string; description: string; icon: string }> = {
  'general_discussion': {
    name: 'General Discussion',
    description: 'Rock 음악에 대한 자유로운 토론',
    icon: '💬',
  },
  'album_reviews': {
    name: 'Album Reviews',
    description: '앨범 리뷰 및 평가',
    icon: '💿',
  },
  'concert_reviews': {
    name: 'Concert Reviews',
    description: '공연 후기 및 리뷰',
    icon: '🎤',
  },
  'hot_topics': {
    name: 'Hot Topics',
    description: '뜨거운 Rock 이슈',
    icon: '🔥',
  },
  'rock_art': {
    name: 'Rock Art Showcase',
    description: 'Rock 테마 창작물 공유',
    icon: '🎨',
  },
};

// 페이지 사이즈
const POSTS_PER_PAGE = 20;

export default async function BoardCategoryPage({ params, searchParams }: BoardCategoryPageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // 카테고리 유효성 검증
  if (!CATEGORIES[category]) {
    notFound();
  }

  const categoryInfo = CATEGORIES[category];
  const supabase = await createClient();

  // 사용자 인증 확인 (관리자 여부)
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  // 게시글 총 개수 조회
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('category', category);

  const totalPosts = totalCount || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 게시글 목록 조회 (페이지네이션, is_pinned 우선 정렬)
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      view_count,
      is_pinned,
      user_id,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq('category', category)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

  if (error) {
    console.error('게시글 로드 실패:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Category Info */}
      <div className="relative bg-gradient-to-br from-red-500 via-amber-500 to-purple-500 py-16 px-4 mb-12">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4">{categoryInfo.icon}</div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-4">
            {categoryInfo.name}
          </h1>
          <p className="text-xl text-white/90">{categoryInfo.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header with New Post Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-700 dark:text-gray-300">
            총 <span className="font-bold text-red-500">{totalPosts}</span>개의 게시글
          </div>
          {isAdmin && (
            <Link
              href={`/board/${category}/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 via-amber-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              ✏️ 새 글 작성
            </Link>
          )}
        </div>

        {/* Post List */}
        {posts && posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/board/${category}/${post.id}`}
                  className="block group"
                >
                  <div
                    className={`
                      relative p-6 rounded-xl transition-all duration-200
                      bg-white dark:bg-gray-800
                      border-2 border-transparent
                      hover:border-red-500 hover:shadow-xl hover:scale-[1.02]
                      ${post.is_pinned ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}
                    `}
                  >
                    {/* Pinned Badge */}
                    {post.is_pinned && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-white">
                          📌 공지
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-500 transition-colors pr-20">
                      {post.title}
                    </h2>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-red-500">
                          {post.users?.username || '익명'}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                      {post.view_count > 0 && (
                        <>
                          <span>•</span>
                          <span>👁️ {post.view_count}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/board/${category}?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    이전
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // 현재 페이지 주변만 표시
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  ) {
                    return (
                      <Link
                        key={pageNum}
                        href={`/board/${category}?page=${pageNum}`}
                        className={`
                          px-4 py-2 rounded-lg font-bold transition-colors
                          ${
                            pageNum === currentPage
                              ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                          }
                        `}
                      >
                        {pageNum}
                      </Link>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}

                {currentPage < totalPages && (
                  <Link
                    href={`/board/${category}?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    다음
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              아직 게시글이 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              이 카테고리의 첫 번째 게시글을 작성해보세요!
            </p>
            {isAdmin && (
              <Link
                href={`/board/${category}/new`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 via-amber-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                ✏️ 첫 글 작성하기
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
