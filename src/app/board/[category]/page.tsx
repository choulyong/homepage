/**
 * Board Page (Dynamic Route) with Tailwind CSS
 * 카테고리별 게시판 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  ai_study: 'AI 스터디',
  bigdata_study: '빅데이터 엔지니어 자격증 스터디',
  free_board: '자유게시판',
  ai_artwork: 'AI 작품 갤러리',
};

export default function BoardPage() {
  const params = useParams();
  const category = params?.category as string;
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!category || !CATEGORY_LABELS[category]) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // 현재 사용자 확인
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // 게시글 가져오기
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };

    loadData();
  }, [category]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!category || !CATEGORY_LABELS[category]) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            존재하지 않는 카테고리입니다
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
          {CATEGORY_LABELS[category]}
        </h1>
        {user && (
          <Link href={`/board/${category}/new`}>
            <Button variant="primary">글쓰기</Button>
          </Link>
        )}
      </div>

      {/* Post List */}
      {posts && posts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/board/${category}/${post.id}`} className="group">
              <Card
                hoverable
                padding="lg"
                className="transition-all duration-200"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h2>

                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>작성자: {post.author_id}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  {post.view_count > 0 && (
                    <>
                      <span>•</span>
                      <span>조회 {post.view_count}</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            아직 게시글이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            첫 게시글을 작성해보세요!
          </p>
          {user && (
            <Link href={`/board/${category}/new`}>
              <Button variant="primary">글쓰기</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
