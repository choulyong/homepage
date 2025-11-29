'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import YouTubePlayer from '@/components/YouTubePlayer';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { cn } from '@/lib/utils';

interface Band {
  id: string;
  name: string;
  country: string | null;
  logo_url: string | null;
  image_url: string | null;
}

interface Album {
  id: string;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  youtube_url: string | null;
  band: Band | null;
}

interface KoreanAlbumsClientProps {
  albums: Album[];
}

export default function KoreanAlbumsClient({ albums }: KoreanAlbumsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-refresh every 60 seconds
  const { lastRefreshTime, isRefreshing } = useAutoRefresh({
    interval: 60000, // 1분마다 자동 새로고침
    enabled: true,
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      router.refresh();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  // Filter albums based on search query
  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;

    const query = searchQuery.toLowerCase();
    return albums.filter(album => {
      // Search in album title
      if (album.title.toLowerCase().includes(query)) return true;

      // Search in band name
      if (album.band?.name.toLowerCase().includes(query)) return true;

      // Search in release year
      if (album.release_year?.toString().includes(query)) return true;

      return false;
    });
  }, [albums, searchQuery]);

  return (
    <>
      {/* Header with Refresh Button */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          {/* Auto-refresh status */}
          {mounted && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isRefreshing ? "bg-green-400" : "bg-blue-400"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isRefreshing ? "bg-green-500" : "bg-blue-500"
                )}></span>
              </span>
              {isRefreshing ? '업데이트 중...' : `마지막 업데이트: ${lastRefreshTime.toLocaleTimeString('ko-KR')}`}
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]',
            refreshing
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 touch-manipulation'
          )}
          aria-label="새로고침"
        >
          <svg
            className={cn('w-5 h-5', refreshing && 'animate-spin')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">
            {refreshing ? '새로고침 중...' : '새로고침'}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Korean albums by title, band, or year..."
            className="w-full px-6 py-4 pl-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
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
          Found <span className="font-semibold text-gray-900 dark:text-white">{filteredAlbums.length}</span> album{filteredAlbums.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Albums Grid */}
      {filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredAlbums.map((album) => (
            <div key={album.id} className="relative group">
              <Link
                href={`/albums/${album.id}`}
                className="block bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-amber-500/50"
              >
                {/* Album Cover */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      💿
                    </div>
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
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-lg"
                        title="Play on YouTube"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Album Info */}
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1 group-hover:text-amber-500 transition-colors line-clamp-2">
                    {album.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {album.band?.name || 'Unknown Band'}
                  </p>
                  <div className="flex items-center gap-2">
                    {album.release_year && (
                      <p className="text-xs text-gray-500">
                        {album.release_year}
                      </p>
                    )}
                    {album.youtube_url && (
                      <span className="text-xs text-red-500" title="YouTube available">
                        ▶️
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No albums found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try a different search term
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Clear Search
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
