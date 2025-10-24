/**
 * Genre Detail Page - Albums filtered by specific genre
 * METALDRAGON Rock Community
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre } = await params;
  const decodedGenre = decodeURIComponent(genre);
  const supabase = await createClient();

  // 특정 장르를 포함하는 앨범 조회
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*, band:bands(*)')
    .contains('genres', JSON.stringify([decodedGenre]))
    .order('release_year', { ascending: false });

  // 에러 로깅
  if (error) {
    console.error('Genre query error:', error);
  }

  if (!albums || albums.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/albums/genres"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 mb-8"
        >
          ← Back to All Genres
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">{decodedGenre}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {albums.length} album{albums.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl p-4 transition-all duration-300 border border-transparent hover:border-amber-500/50"
            >
              {/* Album Cover */}
              <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden">
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    💿
                  </div>
                )}
              </div>

              {/* Album Info */}
              <h3 className="font-bold text-lg mb-1 group-hover:text-amber-500 transition-colors line-clamp-1">
                {album.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                🎸 {album.band?.name}
              </p>
              {album.release_year && (
                <p className="text-xs text-gray-500">
                  📅 {album.release_year}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
