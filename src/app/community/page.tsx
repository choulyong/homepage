/**
 * Community Page - METALDRAGON Rock Community
 * Music Discovery와 Rock Art Showcase 제거됨
 */

import Link from 'next/link';
import { PrismaClient } from '@/generated/prisma';

// Rock Community 게시판 카테고리 (Music Discovery, Rock Art Showcase 제거됨)
const CATEGORIES = [
  {
    id: 'general_discussion',
    name: 'General Discussion',
    description: 'Rock 음악에 대한 자유로운 토론',
    icon: '💬',
  },
  {
    id: 'album_reviews',
    name: 'Album Reviews',
    description: '앨범 리뷰 및 평가',
    icon: '💿',
  },
  {
    id: 'concert_reviews',
    name: 'Concert Reviews',
    description: '공연 후기 및 리뷰',
    icon: '🎤',
  },
  {
    id: 'hot_topics',
    name: 'Hot Topics',
    description: '뜨거운 Rock 이슈',
    icon: '🔥',
  },
];

export default async function CommunityPage() {
  const prisma = new PrismaClient();

  // 최근 게시글 조회 (로컬 PostgreSQL)
  const recentPosts = await prisma.boardPost.findMany({
    orderBy: { created_at: 'desc' },
    take: 20,
  });

  await prisma.$disconnect();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">💬 Rock Community</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rock 음악 팬들과 자유롭게 소통하세요
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            카테고리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/board/${category.id}`}
                className="group relative bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-md hover:shadow-2xl transition-all border-2 border-gray-200 dark:border-zinc-800 hover:border-red-500 hover:scale-105"
              >
                {/* Icon */}
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-500 transition-colors">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        {recentPosts && recentPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              최신 게시글
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-zinc-800">
              {recentPosts.map((post, idx) => {
                const categoryInfo = CATEGORIES.find(cat => cat.id === post.category);

                return (
                  <Link
                    key={post.id}
                    href={`/board/${post.category}/${post.id}`}
                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${
                      idx !== recentPosts.length - 1 ? 'border-b border-gray-200 dark:border-zinc-800' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>👤 {post.author}</span>
                          <span>•</span>
                          <span>👁️ {post.views || 0}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      {categoryInfo && (
                        <span className="ml-4 px-3 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center gap-1">
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.name}</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!recentPosts || recentPosts.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              아직 게시글이 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
