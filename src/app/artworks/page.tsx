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
import { cn } from '@/lib/utils';

export default function ArtworksPage() {
  const [user, setUser] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 현재 사용자 확인
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // AI 작품 게시판의 게시글 가져오기 (ai_artwork 카테고리)
      const { data: artworksData } = await supabase
        .from('posts')
        .select('*')
        .eq('category', 'ai_artwork')
        .order('created_at', { ascending: false });

      setArtworks(artworksData || []);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
          AI 작품 갤러리
        </h1>
        {user && (
          <Link href="/board/ai_artwork/new">
            <Button variant="primary">작품 업로드</Button>
          </Link>
        )}
      </div>

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

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                    {artwork.content.substring(0, 100)}...
                  </p>

                  {/* Meta */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            첫 번째 AI 작품을 업로드해보세요!
          </p>
          {user && (
            <Link href="/board/ai_artwork/new">
              <Button variant="primary">작품 업로드</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
