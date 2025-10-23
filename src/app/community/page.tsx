/**
 * Community Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(20);

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
        {categories && categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              카테고리
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/board/${category.slug}`}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-800 hover:border-red-500"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description || '게시판'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {recentPosts && recentPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              최신 게시글
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-zinc-800">
              {recentPosts.map((post, idx) => (
                <Link
                  key={post.id}
                  href={`/board/${post.category?.slug || 'general_discussion'}/${post.id}`}
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
                        <span>👀 {post.views || 0}</span>
                        <span>❤️ {post.likes || 0}</span>
                        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    {post.category && (
                      <span className="ml-4 px-3 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
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
