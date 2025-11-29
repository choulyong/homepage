import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { isRockMetalBand } from '@/lib/genreFilter';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
}

export default async function CountryBandsPage({ params }: PageProps) {
  const { country } = await params;
  const decodedCountry = decodeURIComponent(country);

  // Fetch bands from specific country from local PostgreSQL via Prisma
  const allBands = await prisma.band.findMany({
    where: {
      country: decodedCountry,
    },
    orderBy: {
      spotify_followers: 'desc',
    },
  });

  // Filter to only rock/metal bands (exclude pop, hip-hop, etc.)
  const bands = allBands.filter(band => isRockMetalBand(band.genres as string[] | null));

  if (!bands || bands.length === 0) {
    notFound();
  }

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

  const totalFollowers = bands.reduce((sum, band) => sum + (band.spotify_followers || 0), 0);
  const avgPopularity = Math.round(
    bands.reduce((sum, band) => sum + (band.spotify_popularity || 0), 0) / bands.length
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/bands" className="hover:text-red-500">Bands</Link>
          <span>/</span>
          <Link href="/bands/countries" className="hover:text-red-500">Countries</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{decodedCountry}</span>
        </div>

        <div className="text-center mb-12">
          <div className="text-8xl mb-4">
            {countryFlags[decodedCountry] || 'UN'}
          </div>
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">{decodedCountry}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Rock & Metal Bands
          </p>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-500">{bands.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500">
                {totalFollowers >= 1000000
                  ? `${(totalFollowers / 1000000).toFixed(1)}M`
                  : `${(totalFollowers / 1000).toFixed(0)}K`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Followers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{avgPopularity}/100</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Popularity</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bands.map((band) => (
            <Link
              key={band.id}
              href={`/bands/${band.id}`}
              className="group bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-amber-500/50"
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                {band.image_url || band.logo_url ? (
                  <img
                    src={band.image_url || band.logo_url}
                    alt={band.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    BAND
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-amber-500 transition-colors line-clamp-1">
                  {band.name}
                </h3>

                {band.genres && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(Array.isArray(band.genres) ? band.genres : [])
                      .slice(0, 2)
                      .map((genre: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-gray-800/50 text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>
                )}

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between items-center">
                    <span>Followers:</span>
                    <span className="font-semibold">
                      {band.spotify_followers >= 1000000
                        ? `${(band.spotify_followers / 1000000).toFixed(1)}M`
                        : band.spotify_followers >= 1000
                        ? `${(band.spotify_followers / 1000).toFixed(0)}K`
                        : band.spotify_followers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Popularity:</span>
                    <span className="font-semibold">{band.spotify_popularity}/100</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
