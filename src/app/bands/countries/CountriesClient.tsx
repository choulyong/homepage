'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface CountryStat {
  country: string;
  count: number;
  totalFollowers: number;
}

interface CountriesClientProps {
  countries: CountryStat[];
  countryFlags: Record<string, string>;
}

export default function CountriesClient({ countries, countryFlags }: CountriesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;

    const query = searchQuery.toLowerCase();
    return countries.filter(({ country }) =>
      country.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries..."
            className="w-full px-6 py-4 pl-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Found <span className="font-semibold text-gray-900 dark:text-white">{filteredCountries.length}</span> countr{filteredCountries.length !== 1 ? 'ies' : 'y'}
        </div>
      )}

      {/* Countries Grid */}
      {filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCountries.map(({ country, count, totalFollowers }) => {
            const encodedCountry = encodeURIComponent(country);
            const flagCode = countryFlags[country] || '🌍';
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
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Followers:</span>
                    <span className="font-semibold">
                      {(totalFollowers / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No countries found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try a different search term
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Clear Search
          </button>
        </div>
      )}
    </>
  );
}
