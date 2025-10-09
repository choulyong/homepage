/**
 * Movies List Page (Public)
 * 영화 리뷰 목록 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/hooks/useAdmin';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  my_rating: number;
  content: string | null;
  review: string;
  watched_at: string | null;
  view_count: number;
  created_at: string;
}

export default function MoviesPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [myRating, setMyRating] = useState('');
  const [content, setContent] = useState('');
  const [review, setReview] = useState('');
  const [watchedAt, setWatchedAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMovies();
  }, [sortBy]);

  const loadMovies = async () => {
    const supabase = createClient();

    let query = supabase.from('movies').select('*');

    if (sortBy === 'date') {
      query = query
        .order('watched_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('my_rating', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading movies:', error);
    } else {
      setMovies(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setPosterUrl(movie.poster_url || '');
    setMyRating(movie.my_rating.toString());
    setContent(movie.content || '');
    setReview(movie.review);
    setWatchedAt(movie.watched_at || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('movies').delete().eq('id', id);

    if (error) {
      console.error('Error deleting movie:', error);
      alert('삭제에 실패했습니다.');
    } else {
      await loadMovies();
      alert('삭제되었습니다.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setPosterUrl('');
    setMyRating('');
    setContent('');
    setReview('');
    setWatchedAt('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !review.trim() || !myRating) return;

    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      // 수정
      const { error } = await supabase
        .from('movies')
        .update({
          title: title.trim(),
          poster_url: posterUrl || null,
          my_rating: parseFloat(myRating),
          content: content.trim() || null,
          review: review.trim(),
          watched_at: watchedAt || null,
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating movie:', error);
        alert('수정에 실패했습니다.');
      } else {
        await loadMovies();
        resetForm();
        alert('수정되었습니다!');
      }
    } else {
      // 새로 작성
      const { error } = await supabase.from('movies').insert({
        user_id: user.id,
        title: title.trim(),
        poster_url: posterUrl || null,
        my_rating: parseFloat(myRating),
        content: content.trim() || null,
        review: review.trim(),
        watched_at: watchedAt || null,
      });

      if (error) {
        console.error('Error creating movie:', error);
        alert('영화 리뷰 작성에 실패했습니다.');
      } else {
        await loadMovies();
        resetForm();
        alert('영화 리뷰가 작성되었습니다!');
      }
    }

    setSaving(false);
  };

  if (loading || adminLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
            영화 리뷰
          </h1>
          <p className="text-lg text-gray-600 dark:text-white">
            나만의 평점과 감상평을 기록하는 공간
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-white'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'rating'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-white'
              }`}
            >
              평점순
            </button>
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              variant="primary"
              size="lg"
              className="whitespace-nowrap"
            >
              🎬 리뷰 작성
            </Button>
          )}
        </div>
      </div>

      {/* Write/Edit Form */}
      {showForm && isAdmin && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? '영화 리뷰 수정' : '새 영화 리뷰 작성'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  영화 제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="영화 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  나의 평점 * (0-10)
                </label>
                <input
                  type="number"
                  value={myRating}
                  onChange={(e) => setMyRating(e.target.value)}
                  required
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.0 ~ 10.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                관람일
              </label>
              <input
                type="date"
                value={watchedAt}
                onChange={(e) => setWatchedAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                줄거리/내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="영화 줄거리나 내용을 간단히 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                감상평 *
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="영화에 대한 나의 감상평을 작성하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                포스터 이미지
              </label>
              <ImageUpload
                onUploadComplete={setPosterUrl}
                currentImageUrl={posterUrl}
                bucket="movies"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                {saving ? (editingId ? '수정 중...' : '작성 중...') : (editingId ? '수정' : '리뷰 작성')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white mb-4">
            아직 영화 리뷰가 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="relative">
              <Link href={`/movies/${movie.id}`}>
                <Card
                  variant="featured"
                  padding="none"
                  className="overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full"
                >
                  {movie.poster_url ? (
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(movie.my_rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-200'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold gradient-text">
                        {movie.my_rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white line-clamp-3">
                      {movie.review}
                    </p>
                  </div>
                </Card>
              </Link>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 z-50">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(movie);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors pointer-events-auto"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(movie.id);
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors pointer-events-auto"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
