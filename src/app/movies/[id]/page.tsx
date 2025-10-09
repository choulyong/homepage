/**
 * Movie Detail Page (Public)
 * 영화 상세 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  my_rating: number | null;
  content: string | null;
  review: string;
  watched_at: string | null;
  view_count: number;
  created_at: string;
  user_id: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadMovie = async () => {
      const supabase = createClient();

      // 현재 사용자 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 영화 가져오기
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading movie:', error);
        router.push('/movies');
      } else {
        setMovie(data);

        // 조회수 증가
        await supabase
          .from('movies')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', params.id);
      }
      setLoading(false);
    };

    loadMovie();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('movies').delete().eq('id', params.id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      router.push('/movies');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white">영화를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === movie.user_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.back()}>
          ← 목록으로
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="lg:col-span-1">
          <Card padding="none" className="overflow-hidden sticky top-8">
            <div className="relative aspect-[2/3] bg-gray-900">
              {movie.poster_url ? (
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  포스터 없음
                </div>
              )}
            </div>

            {/* Rating Badge */}
            {movie.my_rating !== null && (
              <div className="p-6 bg-gradient-to-r from-teal-500 to-indigo-500 text-white">
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">나의 평점</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold">
                      {movie.my_rating.toFixed(1)}
                    </span>
                    <span className="text-xl">/ 10</span>
                  </div>
                  {/* Star Rating */}
                  <div className="flex justify-center mt-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(movie.my_rating || 0)
                            ? 'text-yellow-300'
                            : 'text-gray-400'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-white mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {movie.watched_at && (
                <span>
                  📅 관람일:{' '}
                  {new Date(movie.watched_at).toLocaleDateString('ko-KR')}
                </span>
              )}
              <span>👁️ 조회 {movie.view_count}</span>
            </div>

            {/* Content (줄거리 등) */}
            {movie.content && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  줄거리
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {movie.content}
                </p>
              </div>
            )}

            {/* Review */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                감상평
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {movie.review}
                </p>
              </div>
            </div>

            {/* Action Buttons (Author Only) */}
            {isAuthor && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/admin/movies?edit=${movie.id}`)}
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
      </div>
    </div>
  );
}
