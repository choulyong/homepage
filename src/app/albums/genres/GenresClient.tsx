'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Genre {
  genre: string;
  count: number;
}

interface GenresClientProps {
  genres: Genre[];
}

export default function GenresClient({ genres }: GenresClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter genres based on search query
  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return genres;

    const query = searchQuery.toLowerCase();
    return genres.filter(({ genre }) =>
      genre.toLowerCase().includes(query)
    );
  }, [genres, searchQuery]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search genres..."
            className="w-full px-6 py-4 pl-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Found <span className="font-semibold text-gray-900 dark:text-white">{filteredGenres.length}</span> genre{filteredGenres.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Genre Grid */}
      {filteredGenres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGenres.map(({ genre, count }) => (
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
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No genres found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try a different search term
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-12 text-center">
        <Link
          href="/albums"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          ← Back to All Albums
        </Link>
      </div>
    </>
  );
}
