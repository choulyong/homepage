/**
 * Home Page - METALDRAGON Rock Community
 * Fire Red & Rock Gold gradient hero with Rock features
 */

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import RockFeatureCard from '@/components/RockFeatureCard';
import prisma from '@/lib/prisma';

// 10분마다 페이지 재생성 (ISR)
export const revalidate = 600;

export default async function Home() {
  // Fetch real statistics from database
  const [bandsCount, albumsCount, concertsCount, galleryCount, ashdishCount] = await Promise.all([
    prisma.band.count(),
    prisma.album.count(),
    prisma.concert.count(),
    prisma.gallery.count(),
    prisma.ashDish.count(),
  ]);

  // 실제 활동 회원 수 추정 (게시글 수 기반)
  // 평균적으로 한 사람이 3개의 게시글을 작성한다고 가정
  const totalPosts = galleryCount + ashdishCount;
  const usersCount = Math.max(1, Math.floor(totalPosts / 3));
  const features = [
    {
      title: 'Bands Database',
      description: '전 세계 Rock 밴드들의 정보와 디스코그래피를 탐험하세요',
      icon: '🎸',
      link: '/bands',
    },
    {
      title: 'Album Reviews',
      description: '명반들에 대한 리뷰를 읽고 당신만의 평가를 남기세요',
      icon: '💿',
      link: '/albums',
    },
    {
      title: 'Concerts',
      description: '전 세계 Rock 콘서트 일정을 확인하고 후기를 공유하세요',
      icon: '🎤',
      link: '/concerts',
    },
    {
      title: 'Community',
      description: 'Rock 음악 팬들과 자유롭게 소통하는 커뮤니티',
      icon: '💬',
      link: '/community',
    },
    {
      title: 'Rock News',
      description: '록 뉴스, 오디오 장비, 기타/앰프 리뷰, 콘서트 소식',
      icon: '📰',
      link: '/news',
    },
    {
      title: 'Photo Gallery',
      description: '콘서트 사진과 밴드 이미지를 감상하고 공유하세요',
      icon: '📷',
      link: '/gallery',
    },
    {
      title: 'AI Rock Art',
      description: 'AI로 창작한 Rock 테마 아트워크를 만나보세요',
      icon: '🎨',
      link: '/rock-art',
    },
    {
      title: 'YouTube Videos',
      description: 'Rock 명곡들의 뮤직비디오와 라이브 공연 영상',
      icon: '📺',
      link: '/videos',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500/10 via-amber-500/10 to-purple-500/10 dark:from-red-900/20 dark:via-amber-900/20 dark:to-purple-900/20 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <span className="text-6xl md:text-7xl lg:text-8xl">🎸</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="gradient-text">METALDRAGON</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              The Ultimate Rock Community
            </p>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              전 세계 Rock 음악 팬들을 위한 통합 플랫폼<br />
              밴드, 앨범, 콘서트, 그리고 열정적인 커뮤니티
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/bands">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all">
                  🎸 밴드 탐험하기
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" size="lg" className="border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-8 py-3 rounded-lg transition-all">
                  💬 커뮤니티 참여
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🤘</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}>🎵</div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent mb-2">
                {bandsCount.toLocaleString()}
              </div>
              <div className="text-zinc-400">Rock Bands</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {albumsCount.toLocaleString()}
              </div>
              <div className="text-zinc-400">Albums</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {concertsCount.toLocaleString()}
              </div>
              <div className="text-zinc-400">Concerts</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
                {usersCount.toLocaleString()}
              </div>
              <div className="text-zinc-400">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              🔥 Rock Community Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Rock 음악의 모든 것을 한곳에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature) => (
              <RockFeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                link={feature.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-red-500 via-amber-500 to-purple-500 rounded-2xl p-12 shadow-xl">
            <div className="text-6xl mb-6">🤘</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Unleash the Power of Rock
            </h2>
            <p className="text-xl text-white/90 mb-8">
              지금 바로 METALDRAGON 커뮤니티에 참여하세요<br />
              전 세계 Rock 팬들과 함께 음악을 즐기고 소통하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bands">
                <Button variant="secondary" size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-lg shadow-md">
                  밴드 데이터베이스 탐험
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-lg">
                  커뮤니티 게시판
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl md:text-3xl font-display italic mb-4">
            "Rock 'n' Roll is a way of life."
          </blockquote>
          <p className="text-zinc-400">- Rock Legends</p>
        </div>
      </section>
    </div>
  );
}
