/**
 * Admin Dashboard Home - METALDRAGON Rock Community
 * 관리자 대시보드 메인 페이지 (Prisma + Real Stats)
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    bands: 0,
    albums: 0,
    concerts: 0,
    posts: 0,
    gallery: 0,
  });
  const [recentBands, setRecentBands] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      // localStorage 기반 인증 확인
      const userData = getCurrentUser();
      if (!userData) {
        router.push('/auth/login');
        return;
      }

      setUser(userData);
      console.log('✅ User authenticated:', userData.email || userData.username);
    } catch (err) {
      console.error('❌ Auth error:', err);
      router.push('/auth/login');
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading admin stats...');

      // Fetch real statistics from API with error handling (optimized with limits)
      const results = await Promise.allSettled([
        fetch('/api/bands?limit=10').then(r => r.json()),
        fetch('/api/albums?skip=0&take=10').then(r => r.json()),
        fetch('/api/concerts?limit=10').then(r => r.json()),
        fetch('/api/board-posts?limit=10').then(r => r.json()),
        fetch('/api/gallery?limit=10').then(r => r.json()),
      ]);

      const bandsData = results[0].status === 'fulfilled' ? results[0].value : { bands: [], total: 0 };
      const albumsData = results[1].status === 'fulfilled' ? results[1].value : { albums: [] };
      const concertsData = results[2].status === 'fulfilled' ? results[2].value : { concerts: [] };
      const postsData = results[3].status === 'fulfilled' ? results[3].value : { posts: [] };
      const galleryData = results[4].status === 'fulfilled' ? results[4].value : { posts: [] };

      console.log('✅ Stats loaded:', { bandsData, albumsData, concertsData, postsData, galleryData });

      setStats({
        bands: bandsData.total || bandsData.bands?.length || 0,
        albums: albumsData.albums?.length || 0,
        concerts: concertsData.concerts?.length || 0,
        posts: postsData.posts?.length || 0,
        gallery: galleryData.posts?.length || 0,
      });

      // Get recent bands and albums
      if (bandsData.bands) {
        setRecentBands(bandsData.bands.slice(0, 5));
      }
      if (albumsData.albums) {
        setRecentAlbums(albumsData.albums.slice(0, 5));
      }
    } catch (err) {
      console.error('❌ Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">🎸</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent mb-2">
            METALDRAGON Control Room
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Rock Community 콘텐츠 관리 대시보드
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-xl p-6 border border-red-500/20">
            <div className="text-5xl mb-2">🎸</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {stats.bands}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rock Bands
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-xl p-6 border border-amber-500/20">
            <div className="text-5xl mb-2">💿</div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              {stats.albums}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Albums
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
            <div className="text-5xl mb-2">🎤</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats.concerts}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Concerts
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-xl p-6 border border-pink-500/20">
            <div className="text-5xl mb-2">💬</div>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              {stats.posts}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Community Posts
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-xl p-6 border border-red-500/20">
            <div className="text-5xl mb-2">📸</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {stats.gallery}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gallery Posts
            </div>
          </div>

          <Link
            href="/admin/bands"
            className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Add New
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Add Band/Album
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎵 최근 추가된 콘텐츠
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bands */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎸</span> 최근 등록된 밴드
              </h3>

              {recentBands && recentBands.length > 0 ? (
                recentBands.map((band) => (
                  <div
                    key={band.id}
                    className="py-3 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center last:border-0"
                  >
                    <Link
                      href={`/bands/${band.id}`}
                      className="truncate flex-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {band.name}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                      {band.country}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">등록된 밴드가 없습니다</p>
              )}
            </div>

            {/* Recent Albums */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>💿</span> 최근 등록된 앨범
              </h3>

              {recentAlbums && recentAlbums.length > 0 ? (
                recentAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="py-3 border-b border-gray-200 dark:border-zinc-700 last:border-0"
                  >
                    <Link
                      href={`/albums/${album.id}`}
                      className="block text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <div className="font-medium">{album.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {album.band?.name} • {album.release_year}
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">등록된 앨범이 없습니다</p>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ⚡ 빠른 작업
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/bands"
              className="block p-5 bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="text-3xl mb-2">🎸</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bands & Albums 관리
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                밴드, 앨범 정보 추가, 수정, 삭제
              </p>
            </Link>

            <Link
              href="/bands"
              className="block p-5 bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <div className="text-3xl mb-2">👀</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bands 보기
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                등록된 모든 밴드 목록 보기
              </p>
            </Link>

            <Link
              href="/albums/legend"
              className="block p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="text-3xl mb-2">💿</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                명반 100
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                한국 대중음악 명반 100 관리
              </p>
            </Link>

            <Link
              href="/community"
              className="block p-5 bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
            >
              <div className="text-3xl mb-2">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                커뮤니티 게시판
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                게시글 작성 및 관리
              </p>
            </Link>

            <Link
              href="/gallery"
              className="block p-5 bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="text-3xl mb-2">📸</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                회원 동영상/사진
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                회원 콘텐츠 관리
              </p>
            </Link>

            <Link
              href="/rock-art"
              className="block p-5 bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-gray-200 dark:border-zinc-800 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Rock Art
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI 생성 Rock 아트 갤러리
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
