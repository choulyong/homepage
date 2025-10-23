/**
 * Admin Dashboard Home with Tailwind CSS
 * 관리자 대시보드 메인 페이지
 * Updated: Deploy Button added
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DeployButton from '@/components/DeployButton';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [bandsCount, setBandsCount] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [concertsCount, setConcertsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [recentBands, setRecentBands] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 사용자 정보 가져오기
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // Rock Community 통계 데이터
      const { count: bands } = await supabase
        .from('bands')
        .select('*', { count: 'exact', head: true });
      setBandsCount(bands || 0);

      const { count: albums } = await supabase
        .from('albums')
        .select('*', { count: 'exact', head: true });
      setAlbumsCount(albums || 0);

      const { count: concerts } = await supabase
        .from('concerts')
        .select('*', { count: 'exact', head: true });
      setConcertsCount(concerts || 0);

      const { count: posts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      setPostsCount(posts || 0);

      const { count: news } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });
      setNewsCount(news || 0);

      const { count: videos } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact', head: true });
      setVideosCount(videos || 0);

      // 최근 밴드
      const { data: recentBandsData } = await supabase
        .from('bands')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentBands(recentBandsData || []);

      // 최근 앨범
      const { data: recentAlbumsData } = await supabase
        .from('albums')
        .select('id, title, release_year, band:bands(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentAlbums(recentAlbumsData || []);

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">🎸</div>
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
          METALDRAGON Control Room
        </h1>
        <p className="text-lg text-gray-600 dark:text-white">
          Rock Community 콘텐츠 관리 대시보드
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-red-500/10 to-amber-500/10">
          <div className="text-5xl mb-2">🎸</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {bandsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Rock Bands
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-amber-500/10 to-purple-500/10">
          <div className="text-5xl mb-2">💿</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {albumsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Albums
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="text-5xl mb-2">🎤</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {concertsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Concerts
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-pink-500/10 to-red-500/10">
          <div className="text-5xl mb-2">💬</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {postsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Community Posts
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-red-500/10 to-amber-500/10">
          <div className="text-5xl mb-2">📰</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {newsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Rock News
          </div>
        </Card>

        <Card variant="featured" padding="lg" className="bg-gradient-to-br from-amber-500/10 to-purple-500/10">
          <div className="text-5xl mb-2">📺</div>
          <div className="text-3xl font-bold gradient-text mb-2">
            {videosCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            Rock Videos
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🎵 최근 추가된 콘텐츠
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bands */}
          <Card padding="lg" className="bg-gradient-to-br from-red-500/5 to-amber-500/5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🎸</span> 최근 등록된 밴드
            </h3>

            {recentBands && recentBands.length > 0 ? recentBands.map((band) => (
              <div
                key={band.id}
                className="py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-gray-700 dark:text-gray-300 last:border-0"
              >
                <Link href={`/bands/${band.id}`} className="truncate flex-1 hover:text-red-600 dark:hover:text-red-400">
                  {band.name}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-100 ml-4">
                  {new Date(band.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">등록된 밴드가 없습니다</p>
            )}
          </Card>

          {/* Recent Albums */}
          <Card padding="lg" className="bg-gradient-to-br from-amber-500/5 to-purple-500/5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>💿</span> 최근 등록된 앨범
            </h3>

            {recentAlbums && recentAlbums.length > 0 ? recentAlbums.map((album) => (
              <div
                key={album.id}
                className="py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 last:border-0"
              >
                <Link href={`/albums/${album.id}`} className="block hover:text-amber-600 dark:hover:text-amber-400">
                  <div className="font-medium">{album.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {album.band?.name} • {album.release_year}
                  </div>
                </Link>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">등록된 앨범이 없습니다</p>
            )}
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⚡ 빠른 작업
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/bands"
            className="block p-5 bg-gradient-to-br from-red-500/10 to-amber-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
          >
            <div className="text-3xl mb-2">🎸</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bands 관리
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              밴드 정보 추가, 수정, 삭제
            </p>
          </Link>

          <Link
            href="/albums"
            className="block p-5 bg-gradient-to-br from-amber-500/10 to-purple-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <div className="text-3xl mb-2">💿</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Albums 관리
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              앨범 정보, 트랙리스트 관리
            </p>
          </Link>

          <Link
            href="/concerts"
            className="block p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="text-3xl mb-2">🎤</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Concerts 등록
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              공연 일정 추가 및 관리
            </p>
          </Link>

          <Link
            href="/community"
            className="block p-5 bg-gradient-to-br from-pink-500/10 to-red-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
          >
            <div className="text-3xl mb-2">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              게시글 관리
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              커뮤니티 게시글 작성 및 관리
            </p>
          </Link>

          <Link
            href="/news"
            className="block p-5 bg-gradient-to-br from-red-500/10 to-amber-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
          >
            <div className="text-3xl mb-2">📰</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Rock News
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              Rock 뉴스 크롤링 및 관리
            </p>
          </Link>

          <Link
            href="/videos"
            className="block p-5 bg-gradient-to-br from-amber-500/10 to-purple-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <div className="text-3xl mb-2">📺</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              YouTube Videos
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              Rock 영상 추가 및 관리
            </p>
          </Link>

          <Link
            href="/rock-art"
            className="block p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Rock Art
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              AI 생성 Rock 아트 업로드
            </p>
          </Link>

          <Link
            href="/gallery"
            className="block p-5 bg-gradient-to-br from-pink-500/10 to-red-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
          >
            <div className="text-3xl mb-2">📸</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Photo Gallery
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              공연 및 밴드 사진 관리
            </p>
          </Link>

          <Link
            href="/admin/backgrounds"
            className="block p-5 bg-gradient-to-br from-red-500/10 to-amber-500/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
          >
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              배경화면 설정
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              페이지별 배경 이미지 설정
            </p>
          </Link>

          {/* 🚀 Deploy Button */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-md border-2 border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              프로덕션 배포
            </h3>
            <p className="text-sm text-gray-600 dark:text-white mb-4">
              서버 재배포 및 업데이트
            </p>
            <DeployButton />
          </div>
        </div>
      </section>
    </div>
  );
}
