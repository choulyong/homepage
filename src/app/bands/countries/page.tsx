import Link from 'next/link';
import prisma from '@/lib/prisma';
import CountriesClient from './CountriesClient';

export default async function CountriesPage() {
  // Fetch bands with country info from local PostgreSQL via Prisma
  const bands = await prisma.band.findMany({
    where: {
      country: {
        not: null,
      },
    },
    select: {
      country: true,
      spotify_followers: true,
    },
  });

  const countryStats = bands.reduce((acc, band) => {
    const country = band.country as string;
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

  const sortedCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b.totalFollowers - a.totalFollowers)
    .map(([country, stats]) => ({
      country,
      count: stats.count,
      totalFollowers: stats.totalFollowers
    }));

  const countryFlags: Record<string, string> = {
    'Albania': '🇦🇱',
    'Algeria': '🇩🇿',
    'Andorra': '🇦🇩',
    'Argentina': '🇦🇷',
    'Australia': '🇦🇺',
    'Austria': '🇦🇹',
    'Belarus': '🇧🇾',
    'Belgium': '🇧🇪',
    'Bolivia': '🇧🇴',
    'Brazil': '🇧🇷',
    'Bulgaria': '🇧🇬',
    'Canada': '🇨🇦',
    'Chile': '🇨🇱',
    'China': '🇨🇳',
    'Colombia': '🇨🇴',
    'Croatia': '🇭🇷',
    'Cuba': '🇨🇺',
    'Cyprus': '🇨🇾',
    'Czech Republic': '🇨🇿',
    'Denmark': '🇩🇰',
    'Estonia': '🇪🇪',
    'Fiji': '🇫🇯',
    'Finland': '🇫🇮',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Greece': '🇬🇷',
    'Hong Kong': '🇭🇰',
    'Hungary': '🇭🇺',
    'Iceland': '🇮🇸',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Iran': '🇮🇷',
    'Ireland': '🇮🇪',
    'Israel': '🇮🇱',
    'Italy': '🇮🇹',
    'Jamaica': '🇯🇲',
    'Japan': '🇯🇵',
    'Latvia': '🇱🇻',
    'Lithuania': '🇱🇹',
    'Malaysia': '🇲🇾',
    'Mexico': '🇲🇽',
    'Montenegro': '🇲🇪',
    'Myanmar': '🇲🇲',
    'Netherlands': '🇳🇱',
    'New Zealand': '🇳🇿',
    'Nigeria': '🇳🇬',
    'Norway': '🇳🇴',
    'Peru': '🇵🇪',
    'Philippines': '🇵🇭',
    'Poland': '🇵🇱',
    'Portugal': '🇵🇹',
    'Romania': '🇷🇴',
    'Russia': '🇷🇺',
    'Serbia': '🇷🇸',
    'Singapore': '🇸🇬',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'South Africa': '🇿🇦',
    'South Korea': '🇰🇷',
    'Spain': '🇪🇸',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Taiwan': '🇹🇼',
    'Thailand': '🇹🇭',
    'Turkey': '🇹🇷',
    'Ukraine': '🇺🇦',
    'United Arab Emirates': '🇦🇪',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Venezuela': '🇻🇪',
    'Vietnam': '🇻🇳'
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/bands"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 mb-8"
        >
          ← Back to All Bands
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Bands by Country</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore rock bands from around the world
          </p>
        </div>

        <CountriesClient countries={sortedCountries} countryFlags={countryFlags} />
      </div>
    </div>
  );
}
