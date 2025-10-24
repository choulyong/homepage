import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function CountriesPage() {
  const supabase = await createClient();

  const { data: bands } = await supabase
    .from('bands')
    .select('country, spotify_followers')
    .not('country', 'is', null);

  const countryStats = bands?.reduce((acc, band) => {
    const country = band.country;
    if (!acc[country]) {
      acc[country] = {
        count: 0,
        totalFollowers: 0
      };
    }
    acc[country].count++;
    acc[country].totalFollowers += band.spotify_followers || 0;
    return acc;
  }, {} as Record<string, { count: number; totalFollowers: number }>);

  const sortedCountries = Object.entries(countryStats || {})
    .sort(([, a], [, b]) => b.totalFollowers - a.totalFollowers);

  const countryFlags: Record<string, string> = {
    'South Korea': 'KR',
    'Japan': 'JP',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Germany': 'DE',
    'France': 'FR',
    'Sweden': 'SE',
    'Finland': 'FI',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Australia': 'AU',
    'Canada': 'CA'
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/bands"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 mb-8"
        >
          Back to All Bands
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Bands by Country</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore rock bands from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCountries.map(([country, stats]) => {
            const encodedCountry = encodeURIComponent(country);
            const flagCode = countryFlags[country] || 'UN';
            return (
              <Link
                key={country}
                href={`/bands/countries/${encodedCountry}`}
                className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl p-6 transition-all duration-300 border border-transparent hover:border-amber-500/50"
              >
                <div className="text-6xl mb-4 text-center">
                  {flagCode}
                </div>

                <h3 className="font-bold text-xl mb-3 text-center group-hover:text-amber-500 transition-colors">
                  {country}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between items-center">
                    <span>Bands:</span>
                    <span className="font-semibold">{stats.count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Followers:</span>
                    <span className="font-semibold">
                      {(stats.totalFollowers / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
