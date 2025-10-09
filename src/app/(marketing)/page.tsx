/**
 * Marketing Page (Hero) with PPR - Tailwind CSS
 * Based on appy-html template design
 * Implements Partial Pre-Rendering with streaming metrics
 */

import { Suspense } from 'react';
import { unstable_noStore } from 'next/cache';
import { Button } from '@/components/ui/Button';
import { LiveMetrics, LiveMetricsSkeleton } from './live-metrics';
import Link from 'next/link';

// Enable PPR for this page
export const experimental_ppr = true;

export default async function MarketingPage() {
  unstable_noStore();

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-400 opacity-10 animate-gradient-shift"></div>

        {/* Hero Content */}
        <div className="max-w-4xl text-center z-10">
          <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight animate-fade-in-up">
            Metaldragon Control Room
          </h1>

          <p className="text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
            실시간 학습, 재무 관리, AI 창작물을 하나의 운영 패널에서
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/board/ai_study">
              <Button variant="glass" size="lg">
                스터디 시작하기
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                더 알아보기
              </Button>
            </Link>
          </div>

          {/* Streaming Metrics with Suspense */}
          <Suspense fallback={<LiveMetricsSkeleton />}>
            <LiveMetrics />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          핵심 기능
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Feature Card 1 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              스터디 게시판
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              AI, 빅데이터처리기사 등 다양한 주제의 스터디 자료를 공유하고 토론하세요.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              IT 뉴스 자동 업데이트
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              AI와 코인 관련 최신 뉴스를 매일 자동으로 받아보세요.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              스마트 가계부
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              문자 메시지 연동으로 자동으로 지출을 기록하고 통계를 확인하세요.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI 작품 갤러리
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              AI로 생성한 이미지, 동영상, 음악 등의 창작물을 아카이빙하세요.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              일정 관리
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              캘린더에서 일정을 관리하고 알림을 받아보세요.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              유튜브 커버 링크
            </h3>
            <p className="text-base text-gray-600 dark:text-white leading-relaxed">
              유튜브 커버 영상을 자동으로 수집하고 정리하세요.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
