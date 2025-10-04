/**
 * Home Page - metaldragon Landing Page
 * Modern hero section with teal-indigo gradient
 */

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Home() {
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
              <span className="gradient-text">metaldragon</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              AI, 빅데이터 학습부터 개인 포트폴리오까지
              <br />
              모든 것을 하나의 플랫폼에서
            </p>
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
              다양한 기능을 탐험하세요
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              학습, 창작, 공유가 한곳에서
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
                    <p className="text-gray-600 dark:text-gray-400">
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
              커뮤니티에 참여하고 함께 성장해요
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="lg">
                무료로 가입하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
