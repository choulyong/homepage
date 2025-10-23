/**
 * Bands List Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function BandsPage() {
  const supabase = await createClient();

  const { data: bands, error } = await supabase
    .from('bands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching bands:', error);
  }

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

        {/* Bands Grid */}
        {bands && bands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bands.map((band) => (
              <Link
                key={band.id}
                href={`/bands/${band.id}`}
                className="group bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-zinc-800"
              >
                {/* Band Logo/Image */}
                <div className="aspect-square bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
                  {band.logo_url ? (
                    <img
                      src={band.logo_url}
                      alt={band.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🎸</span>
                  )}
                </div>

                {/* Band Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-500 transition-colors">
                    {band.name}
                  </h3>
                  {band.country && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      📍 {band.country}
                    </p>
                  )}
                  {band.formed_year && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      📅 Since {band.formed_year}
                    </p>
                  )}
                  {band.genres && Array.isArray(band.genres) && band.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {band.genres.slice(0, 3).map((genre: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎸</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              아직 등록된 밴드가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              첫 번째 Rock 밴드를 등록해보세요!
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-lg shadow-lg transition-all"
            >
              밴드 추가하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
