/**
 * Bands List Page - METALDRAGON Rock Community
 */

import { Suspense } from 'react';
import BandsClient from './BandsClient';

// 5분마다 재검증
export const revalidate = 300;

// Loading component
function BandsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
    </div>
  );
}

export default async function BandsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎸 Rock Bands Database</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            전 세계 Rock 밴드들의 정보를 탐험하세요
          </p>
        </div>

        <Suspense fallback={<BandsLoading />}>
          <BandsClient />
        </Suspense>
      </div>
    </div>
  );
}
