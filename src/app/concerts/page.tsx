/**
 * Concerts Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ConcertsPage() {
  const supabase = await createClient();

  const { data: concerts } = await supabase
    .from('concerts')
    .select('*, band:bands(*)')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎤 Rock Concerts</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            전 세계 Rock 콘서트 일정을 확인하세요
          </p>
        </div>

        {concerts && concerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <Link
                key={concert.id}
                href={`/concerts/${concert.id}`}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-zinc-800 hover:border-purple-500"
              >
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6">
                  <div className="text-4xl mb-4 text-center">🎤</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {concert.title}
                  </h3>
                  <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                    {concert.band?.name}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {concert.venue}
                  </p>
                  {concert.city && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🌍 {concert.city}, {concert.country}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    📅 {new Date(concert.event_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              예정된 콘서트가 없습니다
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
