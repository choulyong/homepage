'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  dailyTrend: Array<{ date: string; visits: number }>;
  period: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/stats?days=${period}`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-display font-bold gradient-text mb-8">방문자 통계</h1>
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-display font-bold gradient-text mb-8">방문자 통계</h1>
          <Card variant="elevated" padding="lg">
            <p className="text-gray-600 dark:text-gray-400">통계 데이터를 불러올 수 없습니다.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text">방문자 통계</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="elevated" padding="lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">총 방문 수</div>
            <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
              {stats.totalVisits.toLocaleString()}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">고유 방문자</div>
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* 인기 페이지 */}
        <Card variant="elevated" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">인기 페이지 Top 10</h2>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center gap-3">
                <div className="text-gray-500 dark:text-gray-400 w-8">{index + 1}</div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white font-medium">{page.path}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-1">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${(page.views / stats.topPages[0].views) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium w-16 text-right">
                  {page.views}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 디바이스 & 브라우저 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">디바이스 타입</h2>
            <div className="space-y-3">
              {Object.entries(stats.devices).map(([device, count]) => {
                const total = Object.values(stats.devices).reduce((a, b) => a + b, 0);
                const percentage = ((count / total) * 100).toFixed(1);
                return (
                  <div key={device}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{device}</span>
                      <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">브라우저</h2>
            <div className="space-y-3">
              {Object.entries(stats.browsers)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]) => {
                  const total = Object.values(stats.browsers).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);
                  return (
                    <div key={browser}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{browser}</span>
                        <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* 일별 추이 */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">일별 방문 추이 (최근 7일)</h2>
          <div className="space-y-3">
            {stats.dailyTrend.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="text-gray-600 dark:text-gray-400 w-24">{day.date}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-8 rounded-lg">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-indigo-500 h-8 rounded-lg flex items-center justify-end px-3"
                      style={{
                        width: `${(day.visits / Math.max(...stats.dailyTrend.map(d => d.visits))) * 100}%`,
                      }}
                    >
                      <span className="text-white font-medium text-sm">{day.visits}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
