/**
 * Movies Admin Page
 * 영화 게시판 관리자 페이지 (작성/수정)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Image from 'next/image';

interface MovieForm {
  title: string;
  poster_url: string;
  my_rating: string;
  content: string;
  review: string;
  watched_at: string;
}

function AdminMoviesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState<MovieForm>({
    title: '',
    poster_url: '',
    my_rating: '',
    content: '',
    review: '',
    watched_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 수정 모드인 경우 영화 불러오기
      if (editId) {
        const { data } = await supabase
          .from('movies')
          .select('*')
          .eq('id', editId)
          .single();

        if (data) {
          setFormData({
            title: data.title,
            poster_url: data.poster_url || '',
            my_rating: data.my_rating ? String(data.my_rating) : '',
            content: data.content || '',
            review: data.review || '',
            watched_at: data.watched_at ? data.watched_at : '',
          });
        }
      }

      // 전체 영화 목록 불러오기
      const { data: moviesData } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      setMovies(moviesData || []);
    };

    loadData();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다');
        return;
      }

      // 평점 검증
      const rating = formData.my_rating ? parseFloat(formData.my_rating) : null;
      if (rating !== null && (rating < 0 || rating > 10)) {
        alert('평점은 0-10 사이의 값이어야 합니다');
        return;
      }

      if (editId) {
        // 수정
        const { error } = await supabase
          .from('movies')
          .update({
            title: formData.title,
            poster_url: formData.poster_url || null,
            my_rating: rating,
            content: formData.content || null,
            review: formData.review,
            watched_at: formData.watched_at || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);

        if (error) throw error;
        alert('수정되었습니다');
        router.push(`/movies/${editId}`);
      } else {
        // 새 영화 추가
        const { error } = await supabase.from('movies').insert({
          user_id: user.id,
          title: formData.title,
          poster_url: formData.poster_url || null,
          my_rating: rating,
          content: formData.content || null,
          review: formData.review,
          watched_at: formData.watched_at || null,
        });

        if (error) throw error;
        alert('추가되었습니다');
        setFormData({
          title: '',
          poster_url: '',
          my_rating: '',
          content: '',
          review: '',
          watched_at: '',
        });
        router.push('/movies');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('movies').delete().eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setMovies(movies.filter((m) => m.id !== id));
      alert('삭제되었습니다');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        영화 게시판 관리
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editId ? '영화 수정' : '영화 추가'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Poster */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                포스터 (선택)
              </label>
              <ImageUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, poster_url: url })
                }
                currentImage={formData.poster_url}
                bucket="movies"
              />
            </div>

            {/* My Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                나만의 평점 (0-10)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.my_rating}
                onChange={(e) =>
                  setFormData({ ...formData, my_rating: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                placeholder="예: 8.5"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용 (줄거리 등, 선택)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                감상평 (필수)
              </label>
              <textarea
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                rows={10}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Watched At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                관람일 (선택)
              </label>
              <input
                type="date"
                value={formData.watched_at}
                onChange={(e) =>
                  setFormData({ ...formData, watched_at: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? '저장 중...' : editId ? '수정' : '추가'}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/admin/movies')}
                >
                  취소
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Movies List */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            영화 목록
          </h2>

          <div className="space-y-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex gap-4"
              >
                {/* Poster Thumbnail */}
                {movie.poster_url && (
                  <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {movie.title}
                  </h3>
                  {movie.my_rating && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                      ⭐ {movie.my_rating.toFixed(1)} / 10
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-white">
                    {movie.watched_at
                      ? new Date(movie.watched_at).toLocaleDateString('ko-KR')
                      : '관람일 미정'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/admin/movies?edit=${movie.id}`)}
                  >
                    수정
                  </Button>
                  <Button variant="secondary" onClick={() => handleDelete(movie.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminMoviesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto text-center py-12 text-gray-600 dark:text-white">로딩 중...</div>}>
      <AdminMoviesContent />
    </Suspense>
  );
}
