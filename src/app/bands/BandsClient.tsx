'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface Band {
  id: string;
  name: string;
  country: string | null;
  formed_year: number | null;
  spotify_followers: number;
  spotify_popularity: number;
  genres: string[] | null;
  image_url: string | null;
  logo_url: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BandsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bands, setBands] = useState<Band[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const currentPage = parseInt(searchParams.get('page') || '1');

  // 사용자 정보 로드
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // 밴드 데이터 로드
  useEffect(() => {
    fetchBands();
  }, [currentPage, searchParams]);

  const fetchBands = async () => {
    try {
      setLoading(true);
      const search = searchParams.get('search') || '';
      const page = searchParams.get('page') || '1';

      const response = await fetch(`/api/bands?page=${page}&limit=100&search=${encodeURIComponent(search)}`);
      const data = await response.json();

      setBands(data.bands);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch bands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    params.set('page', '1'); // 검색 시 첫 페이지로
    router.push(`/bands?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/bands?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/bands');
  };

  return (
    <>
      {/* Admin Add Band Button */}
      {user?.isAdmin && (
        <div className="mb-6 flex justify-end">
          <Link href="/bands/add">
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all">
              + Add Band
            </button>
          </Link>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bands by name, country, or genre..."
            className="w-full px-6 py-4 pl-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Results Count */}
      {pagination && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {searchParams.get('search') ? (
            <>
              Found <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> band{pagination.total !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-900 dark:text-white">{((currentPage - 1) * 100) + 1}</span> - <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * 100, pagination.total)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> bands
            </>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin text-6xl mb-4">🎸</div>
          <p className="text-gray-600 dark:text-gray-400">Loading bands...</p>
        </div>
      ) : bands.length > 0 ? (
        <>
          {/* Bands Grid - 모바일 2열 레이아웃 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {bands.map((band) => (
              <Link
                key={band.id}
                href={`/bands/${band.id}`}
                className="group bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                {/* Band Logo/Image - Next.js Image */}
                <div className="relative aspect-square bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center overflow-hidden">
                  {(band.image_url || band.logo_url) ? (
                    <Image
                      src={band.image_url || band.logo_url}
                      alt={band.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      quality={85}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl lg:text-6xl">🎸</span>
                  )}
                </div>

                {/* Band Info - 반응형 */}
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-red-500 transition-colors truncate">
                    {band.name}
                  </h3>

                  {/* 데스크톱: 모든 정보 표시 */}
                  <div className="hidden sm:block">
                    {band.country && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                        📍 {band.country}
                      </p>
                    )}
                    {band.formed_year && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📅 Since {band.formed_year}
                      </p>
                    )}
                  </div>

                  {/* 모바일: 아이콘만 표시 */}
                  <div className="sm:hidden flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    {band.country && <span title={band.country}>📍</span>}
                    {band.formed_year && <span title={`Since ${band.formed_year}`}>📅</span>}
                    {band.spotify_followers > 0 && <span title={`${band.spotify_followers} followers`}>🎵</span>}
                  </div>

                  {/* Spotify Stats - 데스크톱에만 표시 */}
                  {band.spotify_followers > 0 && (
                    <div className="hidden sm:block space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex justify-between items-center">
                        <span>Followers:</span>
                        <span className="font-semibold">
                          {band.spotify_followers >= 1000000
                            ? `${(band.spotify_followers / 1000000).toFixed(1)}M`
                            : band.spotify_followers >= 1000
                            ? `${(band.spotify_followers / 1000).toFixed(0)}K`
                            : band.spotify_followers}
                        </span>
                      </div>
                      {band.spotify_popularity > 0 && (
                        <div className="flex justify-between items-center">
                          <span>Popularity:</span>
                          <span className="font-semibold">{band.spotify_popularity}/100</span>
                        </div>
                      )}
                    </div>
                  )}

                  {band.genres && Array.isArray(band.genres) && band.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {band.genres.slice(0, 3).map((genre: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  pagination.hasPrev
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                    : "bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                )}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-medium transition-all",
                        pageNum === currentPage
                          ? "bg-gradient-to-r from-red-500 to-amber-500 text-white"
                          : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  pagination.hasNext
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                    : "bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                )}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No bands found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try a different search term
          </p>
          <button
            onClick={clearSearch}
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Clear Search
          </button>
        </div>
      )}
    </>
  );
}
