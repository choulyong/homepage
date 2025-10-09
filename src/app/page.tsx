/**
 * Home Page - metaldragon Landing Page
 * Modern hero section with teal-indigo gradient
 */

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  // DB에서 사이트 설정 가져오기
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value');

  const settingsMap: Record<string, string> = {};
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const heroTitle = settingsMap['hero_title'] || 'metaldragon';
  const heroSubtitle = settingsMap['hero_subtitle'] || 'AI, 빅데이터 학습부터 개인 포트폴리오까지<br />모든 것을 하나의 플랫폼에서';
  const featuresTitle = settingsMap['features_title'] || '다양한 기능을 탐험하세요';
  const featuresDescription = settingsMap['features_description'] || '학습, 창작, 공유가 한곳에서';

  const features = [
    {
      title: 'AI 스터디',
      description: '최신 AI 기술을 함께 학습하고 토론하는 커뮤니티',
      icon: '🤖',
      link: '/board/ai_study',
    },
    {
      title: '빅데이터 스터디',
      description: '데이터 분석과 머신러닝을 실전으로 익히는 스터디',
      icon: '📊',
      link: '/board/bigdata_study',
    },
    {
      title: '자유게시판',
      description: '자유롭게 생각을 나누는 커뮤니티 공간',
      icon: '💬',
      link: '/free-board',
    },
    {
      title: '갤러리',
      description: '일상의 순간을 원본 화질로 공유하세요',
      icon: '📷',
      link: '/gallery',
    },
    {
      title: '영화 리뷰',
      description: '나만의 평점과 감상평을 기록하는 공간',
      icon: '🎬',
      link: '/movies',
    },
    {
      title: 'IT 뉴스',
      description: '최신 IT 트렌드와 기술 뉴스를 한눈에',
      icon: '📰',
      link: '/news',
    },
    {
      title: 'AI 작품',
      description: 'AI로 창작한 다양한 예술 작품들을 감상하세요',
      icon: '🎨',
      link: '/artworks',
    },
    {
      title: 'YouTube 채널',
      description: '기술 튜토리얼과 프로젝트 영상',
      icon: '📺',
      link: '/youtube',
    },
    {
      title: '일정 관리',
      description: '스터디 일정과 이벤트를 확인하고 관리',
      icon: '📅',
      link: '/schedule',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500/10 via-indigo-500/10 to-purple-500/10 dark:from-teal-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="gradient-text">{heroTitle}</span>
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: heroSubtitle }}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/board/ai_study">
                <Button size="lg">
                  시작하기
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  더 알아보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              {featuresTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-white">
              {featuresDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.link}>
                <Card hoverable className="h-full">
                  <CardHeader>
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-white">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-teal-500 to-indigo-500 rounded-2xl p-12 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-white/90 mb-8">
              자유롭게 댓글을 남기고 소통해보세요
            </p>
            <Link href="/board/ai_study">
              <Button variant="secondary" size="lg">
                게시판 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
