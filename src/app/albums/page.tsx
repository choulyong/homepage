/**
 * Albums Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AlbumsPage() {
  const supabase = await createClient();

  const { data: albums } = await supabase
    .from('albums')
    .select('*, band:bands(*)')
    .order('release_year', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">💿 Album Reviews</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            명반들에 대한 리뷰를 읽고 당신만의 평가를 남기세요
          </p>
        </div>

        {albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="group"
              >
                <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-6xl">💿</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                  {album.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {album.band?.name || 'Unknown'}
                </p>
                {album.release_year && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {album.release_year}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💿</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              아직 등록된 앨범이 없습니다
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
