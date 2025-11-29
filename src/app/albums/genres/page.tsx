/**
 * Genres Page - Album Classification by Genre
 * METALDRAGON Rock Community
 */
import prisma from '@/lib/prisma';
import GenresClient from './GenresClient';

export default async function GenresPage() {
  // Get all albums with genres from local PostgreSQL via Prisma
  const albums = await prisma.album.findMany({
    where: {
      genres: {
        isEmpty: false, // This checks that the genres array is NOT empty
      },
    },
    select: {
      genres: true,
    },
  });

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

        <GenresClient genres={sortedGenres} />
      </div>
    </div>
  );
}
