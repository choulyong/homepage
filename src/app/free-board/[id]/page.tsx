/**
 * Free Board Detail Page (Public)
 * 자유게시판 상세 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
  view_count: number;
  created_at: string;
  user_id: string;
}

export default function FreeBoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadPost = async () => {
      const supabase = createClient();

      // 현재 사용자 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 게시글 가져오기
      const { data, error } = await supabase
        .from('free_board')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading post:', error);
        router.push('/free-board');
      } else {
        setPost(data);

        // 조회수 증가
        await supabase
          .from('free_board')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', params.id);
      }
      setLoading(false);
    };

    loadPost();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('free_board').delete().eq('id', params.id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      router.push('/free-board');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white">게시글을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === post.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.back()}>
          ← 목록으로
        </Button>
      </div>

      {/* Post Content */}
      <Card padding="lg">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-white mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
          <span>조회 {post.view_count}</span>
        </div>

        {/* Images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.image_urls.map((url: string, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={url}
                    alt={`${post.title} - 이미지 ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback to old single image */}
        {!post.image_urls && post.image_url && (
          <div className="w-full mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {post.content}
          </p>
        </div>

        {/* Action Buttons (Author Only) */}
        {isAuthor && (
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={() => router.push(`/admin/free-board?edit=${post.id}`)}
            >
              수정
            </Button>
            <Button variant="secondary" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
