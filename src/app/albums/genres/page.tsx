/**
 * Genres Page - Album Classification by Genre
 * METALDRAGON Rock Community
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function GenresPage() {
  const supabase = await createClient();

  // 모든 앨범에서 장르 추출 및 집계
  const { data: albums } = await supabase
    .from('albums')
    .select('genres')
    .not('genres', 'is', null);

  // 장르별 앨범 수 집계
  const genreCounts: Record<string, number> = {};

  albums?.forEach((album) => {
    if (album.genres && Array.isArray(album.genres)) {
      album.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  // 장르를 앨범 수로 정렬
  const sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([genre, count]) => ({ genre, count }));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Rock Genres</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore albums by genre
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedGenres.map(({ genre, count }) => (
            <Link
              key={genre}
              href={`/albums/genres/${encodeURIComponent(genre)}`}
              className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl p-6 transition-all duration-300 border border-transparent hover:border-amber-500/50"
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">🎸</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-amber-500 transition-colors">
                  {genre}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {count} album{count !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/albums"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500"
          >
            ← Back to All Albums
          </Link>
        </div>
      </div>
    </div>
  );
}
