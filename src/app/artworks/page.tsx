/**
 * AI Artworks Gallery Page with Tailwind CSS
 * AI 작품 갤러리 (이미지, 영상, 음악, 문서)
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

export default function ArtworksPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    const supabase = createClient();

    const { data: artworksData } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'ai_artwork')
      .order('created_at', { ascending: false});

    setArtworks(artworksData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      category: 'ai_artwork',
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null,
    });

    if (error) {
      console.error('Error creating artwork:', error);
      alert('작품 업로드에 실패했습니다.');
    } else {
      await loadArtworks();
      setTitle('');
      setContent('');
      setImageUrl('');
      setShowForm(false);
      alert('작품이 업로드되었습니다!');
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
            AI 작품 갤러리
          </h1>
          <p className="text-lg text-gray-600 dark:text-white">
            AI로 창작한 다양한 예술 작품들을 감상하세요
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
            size="lg"
            className="whitespace-nowrap"
          >
            🎨 작품 올리기
          </Button>
        )}
      </div>

      {/* Write Form */}
      {showForm && isAdmin && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            새 AI 작품 업로드
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                작품 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="작품 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                작품 설명 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="AI 프롬프트, 사용한 모델, 작품 설명 등을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                작품 이미지 *
              </label>
              <ImageUpload
                onUploadComplete={setImageUrl}
                currentImageUrl={imageUrl}
                bucket="artworks"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                {saving ? '업로드 중...' : '작품 업로드'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Artwork Grid */}
      {artworks && artworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/board/ai_artwork/${artwork.id}`}
              className="group"
            >
              <Card
                hoverable
                padding="none"
                className="h-full flex flex-col overflow-hidden"
              >
                {/* Artwork Media */}
                <div className="relative w-full h-[300px] bg-gray-800 dark:bg-gray-900 overflow-hidden">
                  {artwork.image_url ? (
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 flex items-center justify-center text-gray-500">
                      No Preview
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <span className="absolute top-3 right-3 px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-semibold uppercase">
                    AI ART
                  </span>
                </div>

                {/* Artwork Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {artwork.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-white mb-3 line-clamp-2 flex-1">
                    {artwork.content.substring(0, 100)}...
                  </p>

                  {/* Meta */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-100">
                    <span>{new Date(artwork.created_at).toLocaleDateString('ko-KR')}</span>
                    <span>조회 {artwork.view_count || 0}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            아직 작품이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-white">
            첫 번째 AI 작품을 업로드해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
