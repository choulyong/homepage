/**
 * Admin Posts Management - Tailwind CSS
 * 게시글 관리 페이지 (목록, 수정, 삭제)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'ai_study', label: 'AI 스터디' },
  { value: 'bigdata_study', label: '빅데이터 스터디' },
  { value: 'free_board', label: '자유게시판' },
  { value: 'ai_artwork', label: 'AI 작품' },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  const loadPosts = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage({ type: 'error', text: '게시글을 불러오는데 실패했습니다.' });
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
    } else {
      setMessage({ type: 'success', text: '게시글이 삭제되었습니다.' });
      loadPosts();
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found ? found.label : category;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'ai_study':
        return 'bg-teal-500';
      case 'bigdata_study':
        return 'bg-indigo-500';
      case 'free_board':
        return 'bg-green-500';
      case 'ai_artwork':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center p-12 text-gray-400">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          게시글 관리
        </h1>
        <Link href="/board/ai_study/new">
          <Button variant="primary">+ 새 게시글 작성</Button>
        </Link>
      </div>

      {message && (
        <div
          className={cn(
            'p-4 rounded-md mb-4 border',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium text-white transition-all duration-200',
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-teal-500 to-indigo-400'
                : 'bg-white/10 hover:bg-white/15 hover:-translate-y-0.5'
            )}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
            {category.value === 'all'
              ? ` (${posts.length})`
              : ` (${posts.filter((p) => p.category === category.value).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg overflow-hidden">
        {filteredPosts && filteredPosts.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="bg-white/15 border-b-2 border-white/10">
              <tr>
                <th className="w-[10%] p-4 text-left text-sm font-semibold text-gray-300">
                  카테고리
                </th>
                <th className="w-[40%] p-4 text-left text-sm font-semibold text-gray-300">제목</th>
                <th className="w-[10%] p-4 text-left text-sm font-semibold text-gray-300">
                  조회수
                </th>
                <th className="w-[15%] p-4 text-left text-sm font-semibold text-gray-300">
                  작성일
                </th>
                <th className="w-[25%] p-4 text-left text-sm font-semibold text-gray-300">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-white/10 transition-all duration-200 hover:bg-white/10"
                >
                  <td className="p-4 text-sm text-gray-300">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium text-white',
                        getCategoryBadgeColor(post.category)
                      )}
                    >
                      {getCategoryLabel(post.category)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{post.title}</td>
                  <td className="p-4 text-sm text-gray-300">{post.view_count || 0}</td>
                  <td className="p-4 text-sm text-gray-300">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    <div className="flex gap-2">
                      <Link href={`/board/${post.category}/${post.id}`}>
                        <Button variant="outline" size="sm">
                          보기
                        </Button>
                      </Link>
                      <Link href={`/board/${post.category}/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)}>
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-12 text-gray-400">
            <h2 className="text-xl font-semibold mb-2">게시글이 없습니다</h2>
            <p>새 게시글을 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
