/**
 * Concerts Page - METALDRAGON Rock Community
 * Shows both upcoming and past concerts with YouTube videos
 */

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function ConcertsPage() {
  const supabase = await createClient();

  // 미래 콘서트 (upcoming)
  const { data: upcomingConcerts } = await supabase
    .from('concerts')
    .select('*, band:bands(*)')
    .eq('past_event', false)
    .order('event_date', { ascending: true })
    .limit(50);

  // 과거 콘서트 (past)
  const { data: pastConcerts } = await supabase
    .from('concerts')
    .select('*, band:bands(*)')
    .eq('past_event', true)
    .order('event_date', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎤 Rock Concerts</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            전 세계 Rock 콘서트 일정 및 공연 영상
          </p>
        </div>

        {/* Upcoming Concerts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔜 Upcoming Concerts
            </h2>
            <span className="text-sm text-gray-500">
              {upcomingConcerts?.length || 0} concerts
            </span>
          </div>

          {upcomingConcerts && upcomingConcerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-amber-500/50"
                >
                  {/* Poster or Band Image */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                    {concert.poster_url || concert.band?.image_url || concert.band?.logo_url ? (
                      <Image
                        src={concert.poster_url || concert.band?.image_url || concert.band?.logo_url}
                        alt={concert.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        🎤
                      </div>
                    )}
                  </div>

                  {/* Concert Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors line-clamp-2">
                      {concert.title}
                    </h3>
                    <p className="text-red-600 dark:text-red-400 font-semibold mb-3">
                      {concert.band?.name}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>📍 {concert.venue}</p>
                      {concert.city && (
                        <p>🌍 {concert.city}, {concert.country}</p>
                      )}
                      {concert.event_date && (
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          📅 {new Date(concert.event_date).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400">
                예정된 콘서트가 없습니다
              </p>
            </div>
          )}
        </section>

        {/* Past Concerts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              📼 Past Concerts
            </h2>
            <span className="text-sm text-gray-500">
              {pastConcerts?.length || 0} concerts
            </span>
          </div>

          {pastConcerts && pastConcerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="group bg-gradient-to-br from-gray-500/10 to-blue-500/10 hover:from-gray-500/20 hover:to-blue-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-blue-500/50"
                >
                  {/* YouTube Thumbnail or Band Image */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                    {concert.youtube_url && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                        ▶ VIDEO
                      </div>
                    )}
                    {concert.poster_url || concert.band?.image_url || concert.band?.logo_url ? (
                      <Image
                        src={concert.poster_url || concert.band?.image_url || concert.band?.logo_url}
                        alt={concert.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        📼
                      </div>
                    )}
                  </div>

                  {/* Concert Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                      {concert.title}
                    </h3>
                    <p className="text-red-600 dark:text-red-400 font-semibold mb-3">
                      {concert.band?.name}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>📍 {concert.venue}</p>
                      {concert.city && (
                        <p>🌍 {concert.city}, {concert.country}</p>
                      )}
                      {concert.event_date && (
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          📅 {new Date(concert.event_date).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400">
                과거 콘서트 기록이 없습니다
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
