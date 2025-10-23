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
  const [postsCount, setPostsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 사용자 정보 가져오기
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // 통계 데이터 가져오기
      const { count: posts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      setPostsCount(posts || 0);

      const { count: users } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      setUsersCount(users || 0);

      const { count: news } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });
      setNewsCount(news || 0);

      const { count: videos } = await supabase
        .from('youtube_videos')
        .select('*', { count: 'exact', head: true });
      setVideosCount(videos || 0);

      const { count: contacts } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      setContactsCount(contacts || 0);

      const { count: schedules } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true });
      setSchedulesCount(schedules || 0);

      // 최근 게시글
      const { data: recent } = await supabase
        .from('posts')
        .select('id, title, created_at, view_count')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentPosts(recent || []);

      // 인기 게시글
      const { data: popular } = await supabase
        .from('posts')
        .select('id, title, view_count')
        .order('view_count', { ascending: false })
        .limit(5);
      setPopularPosts(popular || []);

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
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
          환영합니다, {user?.email}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-white">
          Metaldragon Control Room에서 모든 콘텐츠를 관리하세요
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {postsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            총 게시글
          </div>
        </Card>

        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {usersCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            등록된 사용자
          </div>
        </Card>

        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {newsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            IT 뉴스
          </div>
        </Card>

        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {videosCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            YouTube 영상
          </div>
        </Card>

        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {schedulesCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            일정
          </div>
        </Card>

        <Card variant="featured" padding="lg">
          <div className="text-3xl font-bold gradient-text mb-2">
            {contactsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            읽지 않은 문의
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          최근 활동
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <Card padding="lg" className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              최근 게시글
            </h3>

            {recentPosts && recentPosts.map((post) => (
              <div
                key={post.id}
                className="py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-gray-700 dark:text-gray-300 last:border-0"
              >
                <span className="truncate flex-1">{post.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-100 ml-4">
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </Card>

          {/* Popular Posts */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              인기 게시글 TOP 5
            </h3>

            {popularPosts && popularPosts.map((post, index) => (
              <div
                key={post.id}
                className="py-2 mb-2 text-gray-700 dark:text-gray-300 text-sm"
              >
                <span className="text-teal-600 dark:text-teal-400 font-semibold mr-2">
                  #{index + 1}
                </span>
                {post.title}
                <span className="float-right text-xs text-gray-500 dark:text-gray-100">
                  조회 {post.view_count}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          빠른 작업
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/about"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              프로필 편집
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              자기소개, 사진, 포트폴리오 정보를 수정하세요
            </p>
          </Link>

          <Link
            href="/admin/posts"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              새 게시글 작성
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              AI 스터디, 빅데이터 스터디, 자유게시판에 글을 작성하세요
            </p>
          </Link>

          <Link
            href="/admin/ai-artwork"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI 작품 업로드
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              AI로 생성한 이미지, 영상, 음악을 업로드하세요
            </p>
          </Link>

          <Link
            href="/admin/news"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              IT 뉴스 관리
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              AI, 암호화폐 관련 뉴스를 추가하거나 편집하세요
            </p>
          </Link>

          <Link
            href="/admin/finance"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              가계부 입력
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              수입/지출 내역을 기록하고 통계를 확인하세요
            </p>
          </Link>

          <Link
            href="/admin/youtube"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              YouTube 링크
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              커버 영상 링크를 추가하거나 관리하세요
            </p>
          </Link>

          <Link
            href="/admin/site-settings"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              사이트 설정
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              홈페이지 메인 텍스트를 수정하세요
            </p>
          </Link>

          <Link
            href="/admin/backgrounds"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎨 배경화면 설정
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              페이지별 배경화면과 투명도를 조절하세요
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="block p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📊 방문자 통계
            </h3>
            <p className="text-sm text-gray-600 dark:text-white">
              사이트 방문자 데이터와 트래픽 분석을 확인하세요
            </p>
          </Link>

          {/* 🚀 Deploy Button */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-md border-2 border-blue-300 dark:border-blue-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚀 프로덕션 배포
            </h3>
            <p className="text-sm text-gray-600 dark:text-white mb-4">
              코드 수정 후 원클릭으로 서버를 재배포하세요
            </p>
            <DeployButton />
          </div>
        </div>
      </section>
    </div>
  );
}
