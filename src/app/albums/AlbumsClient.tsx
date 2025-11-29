'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import YouTubePlayer from '@/components/YouTubePlayer';

interface Band {
  id: string;
  name: string;
  country: string | null;
}

interface Album {
  id: string;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  youtube_url: string | null;
  band: Band | null;
}

interface AlbumsClientProps {
  initialAlbums: Album[];
  countries: string[];
  totalCount: number;
}

type SortOption = 'newest' | 'oldest';

export default function AlbumsClient({ initialAlbums, countries, totalCount }: AlbumsClientProps) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load more albums
  const loadMoreAlbums = async () => {
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/albums?skip=${albums.length}&take=500`);
      if (!response.ok) throw new Error('Failed to fetch more albums');

      const data = await response.json();
      setAlbums(prev => [...prev, ...data.albums]);
    } catch (error) {
      console.error('Error loading more albums:', error);
      alert('앨범을 더 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter and sort albums
  const filteredAndSortedAlbums = useMemo(() => {
    let result = [...albums];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(album => {
        // Search in album title
        if (album.title.toLowerCase().includes(query)) return true;

        // Search in band name
        if (album.band?.name.toLowerCase().includes(query)) return true;

        // Search in country
        if (album.band?.country?.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    // Filter by country
    if (selectedCountry !== 'all') {
      result = result.filter(album => album.band?.country === selectedCountry);
    }

    // Sort by release year
    result.sort((a, b) => {
      const yearA = a.release_year || 0;
      const yearB = b.release_year || 0;

      if (sortBy === 'newest') {
        return yearB - yearA; // Descending
      } else {
        return yearA - yearB; // Ascending
      }
    });

    return result;
  }, [albums, selectedCountry, sortBy, searchQuery]);

  const hasMore = albums.length < totalCount;

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search albums by title, band, or country..."
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

      {/* Filter and Sort Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Country Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            🌍 Country:
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            📅 Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Category Links */}
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            href="/albums/korean"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 sm:flex-initial justify-center"
          >
            🇰🇷 K-Rock
          </Link>
          <Link
            href="/albums/genres"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 sm:flex-initial justify-center"
          >
            🎸 Genre
          </Link>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {searchQuery || selectedCountry !== 'all' ? (
          <>
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedAlbums.length}</span> albums
            {selectedCountry !== 'all' && ` from ${selectedCountry}`}
          </>
        ) : (
          <>
            Showing <span className="font-semibold text-gray-900 dark:text-white">{albums.length.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalCount.toLocaleString()}</span> total albums
          </>
        )}
      </div>

      {/* Albums Grid */}
      {filteredAndSortedAlbums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAndSortedAlbums.map((album) => (
            <div key={album.id} className="relative group">
              <Link
                href={`/albums/${album.id}`}
                className="block"
              >
                <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">💿</span>
                  )}

                  {/* YouTube Play Button Overlay */}
                  {album.youtube_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedAlbum(album);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform hover:scale-110 transition-all shadow-lg"
                        title="Play on YouTube"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-amber-500 transition-colors">
                  {album.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {album.band?.name || 'Unknown'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {album.release_year && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {album.release_year}
                    </span>
                  )}
                  {album.band?.country && (
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      • {album.band.country}
                    </span>
                  )}
                  {album.youtube_url && (
                    <span className="text-xs text-red-500" title="YouTube available">
                      ▶️
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💿</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedCountry === 'all'
              ? '아직 등록된 앨범이 없습니다'
              : `${selectedCountry}의 앨범이 없습니다`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            다른 필터를 선택해보세요
          </p>
        </div>
      )}

      {/* Load More Button */}
      {!searchQuery && selectedCountry === 'all' && hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMoreAlbums}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoadingMore ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                로딩 중...
              </>
            ) : (
              <>
                <span className="text-xl">⬇️</span>
                더 보기 ({(totalCount - albums.length).toLocaleString()}개 남음)
              </>
            )}
          </button>
        </div>
      )}

      {/* YouTube Player Modal - Outside of Link */}
      {selectedAlbum && selectedAlbum.youtube_url && (
        <YouTubePlayer
          youtubeUrl={selectedAlbum.youtube_url}
          albumTitle={selectedAlbum.title}
          bandName={selectedAlbum.band?.name}
          isOpen={true}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
}
