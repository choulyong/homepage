'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { cn } from '@/lib/utils';

interface Concert {
  id: string;
  title: string;
  venue: string;
  location: string;
  city: string | null;
  country: string | null;
  date: Date | string;
  poster_url: string | null;
  youtube_url: string | null;
  band: {
    id: string;
    name: string;
    logo_url: string | null;
    image_url: string | null;
  } | null;
}

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  images?: Array<{ url: string; width: number; height: number }>;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: { name: string };
      country: { name: string };
    }>;
    attractions?: Array<{
      name: string;
    }>;
  };
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
}

interface Props {
  initialUpcoming: Concert[];
  initialPast: Concert[];
  ticketmasterEvents?: TicketmasterEvent[];
}

export default function ConcertsClient({ initialUpcoming, initialPast, ticketmasterEvents = [] }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Auto-refresh every 60 seconds (Ticketmaster data included)
  const { lastRefreshTime, isRefreshing: autoRefreshing } = useAutoRefresh({
    interval: 60000, // 1분마다 자동 새로고침
    enabled: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      router.refresh();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                <span className="gradient-text">🎤 Rock Concerts</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                전 세계 Rock 콘서트 일정 및 공연 영상
              </p>
              {/* Auto-refresh status */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    autoRefreshing ? "bg-green-400" : "bg-blue-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    autoRefreshing ? "bg-green-500" : "bg-blue-500"
                  )}></span>
                </span>
                {autoRefreshing ? '업데이트 중...' : `마지막 업데이트: ${lastRefreshTime.toLocaleTimeString('ko-KR')}`}
              </p>
            </div>

            {/* Admin Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                refreshing
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
              }`}
            >
              <svg
                className={`w-5 h-5 ${refreshing && 'animate-spin'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* Upcoming Concerts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔜 Upcoming Concerts
            </h2>
            <span className="text-sm text-gray-500">
              {initialUpcoming?.length || 0} concerts
            </span>
          </div>

          {initialUpcoming && initialUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialUpcoming.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-amber-500/50"
                >
                  {/* Poster or Band Image */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {concert.poster_url || concert.band?.image_url || concert.band?.logo_url ? (
                      <Image
                        src={concert.poster_url || concert.band?.image_url || concert.band?.logo_url}
                        alt={concert.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={85}
                        loading="lazy"
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
                      {concert.date && (
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          📅 {new Date(concert.date).toLocaleDateString('ko-KR')}
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
                데이터베이스에 예정된 콘서트가 없습니다
              </p>
            </div>
          )}
        </section>

        {/* Ticketmaster Events */}
        {ticketmasterEvents && ticketmasterEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🎫 Ticketmaster Rock Concerts
              </h2>
              <span className="text-sm text-gray-500">
                {ticketmasterEvents.length} events from Ticketmaster
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketmasterEvents.map((event) => {
                const venue = event._embedded?.venues?.[0];
                const artist = event._embedded?.attractions?.[0];
                const image = event.images?.find(img => img.width > 1000)?.url || event.images?.[0]?.url;
                const priceRange = event.priceRanges?.[0];

                return (
                  <a
                    key={event.id}
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-blue-500/10 to-green-500/10 hover:from-blue-500/20 hover:to-green-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-blue-500/50"
                  >
                    {/* Event Image */}
                    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={event.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          quality={85}
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                          🎸
                        </div>
                      )}
                      {/* Ticketmaster Badge */}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        🎫 TICKETMASTER
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                      {artist && (
                        <p className="text-red-600 dark:text-red-400 font-semibold mb-3">
                          {artist.name}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {venue && (
                          <>
                            <p>📍 {venue.name}</p>
                            <p>🌍 {venue.city.name}, {venue.country.name}</p>
                          </>
                        )}
                        {event.dates?.start && (
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            📅 {new Date(event.dates.start.localDate).toLocaleDateString('ko-KR')}
                            {event.dates.start.localTime && ` ${event.dates.start.localTime}`}
                          </p>
                        )}
                        {priceRange && (
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            💵 {priceRange.currency} ${priceRange.min} - ${priceRange.max}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Legend's Concerts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🏆 Legend's Concerts
            </h2>
            <span className="text-sm text-gray-500">
              {initialPast?.length || 0} legendary performances
            </span>
          </div>

          {initialPast && initialPast.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialPast.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="group bg-gradient-to-br from-gray-500/10 to-blue-500/10 hover:from-gray-500/20 hover:to-blue-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-blue-500/50"
                >
                  {/* YouTube Thumbnail or Band Image */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={85}
                        loading="lazy"
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
                      {concert.date && (
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          📅 {new Date(concert.date).toLocaleDateString('ko-KR')}
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
