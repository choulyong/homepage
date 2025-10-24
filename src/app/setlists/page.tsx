'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Band {
  id: string;
  name: string;
  logo_url: string | null;
  genres: string[];
}

interface Setlist {
  id: string;
  band_id: string;
  title: string;
  venue: string | null;
  event_date: string | null;
  description: string | null;
  created_at: string;
  bands: Band;
  song_count?: number;
}

export default function SetlistsPage() {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchSetlists();
  }, []);

  async function fetchSetlists(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // setlists 테이블에서 데이터 가져오기 (밴드 정보 포함)
      const { data, error } = await supabase
        .from('setlists')
        .select(`
          *,
          bands (
            id,
            name,
            logo_url,
            genres
          )
        `)
        .eq('is_public', true)
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching setlists:', error);
        return;
      }

      // 각 setlist의 곡 수 가져오기
      const setlistsWithCount = await Promise.all(
        (data || []).map(async (setlist) => {
          const { count } = await supabase
            .from('setlist_songs')
            .select('*', { count: 'exact', head: true })
            .eq('setlist_id', setlist.id);

          return {
            ...setlist,
            song_count: count || 0,
          };
        })
      );

      setSetlists(setlistsWithCount);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    await fetchSetlists(true);
  }

  const filteredSetlists = setlists.filter((setlist) => {
    const matchesGenre =
      selectedGenre === 'all' ||
      setlist.bands?.genres?.includes(selectedGenre);

    const matchesSearch =
      !searchQuery ||
      setlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setlist.bands?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setlist.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGenre && matchesSearch;
  });

  const allGenres = Array.from(
    new Set(
      setlists.flatMap((s) => s.bands?.genres || [])
    )
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading setlists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">
              🎸 Concert Setlists
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
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
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          <p className="text-zinc-400">
            Explore setlists from your favorite rock bands
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search setlists, bands, or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          {allGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                All Genres
              </button>
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedGenre === genre
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Setlists Grid */}
        {filteredSetlists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">
              {setlists.length === 0
                ? 'No setlists available yet.'
                : 'No setlists match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSetlists.map((setlist) => (
              <Link
                key={setlist.id}
                href={`/setlists/${setlist.id}`}
                className="group"
              >
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-200">
                  {/* Band Info */}
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center space-x-3">
                      {setlist.bands?.logo_url ? (
                        <img
                          src={setlist.bands.logo_url}
                          alt={setlist.bands.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          🎸
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {setlist.bands?.name || 'Unknown Band'}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {setlist.song_count || 0} songs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setlist Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-500 transition-colors">
                      {setlist.title}
                    </h3>

                    {setlist.venue && (
                      <div className="text-sm text-zinc-400 mb-1 flex items-center">
                        <span className="mr-2">📍</span>
                        {setlist.venue}
                      </div>
                    )}

                    {setlist.event_date && (
                      <div className="text-sm text-zinc-400 mb-3 flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(setlist.event_date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    )}

                    {setlist.description && (
                      <p className="text-sm text-zinc-500 line-clamp-2">
                        {setlist.description}
                      </p>
                    )}

                    {/* Genres */}
                    {setlist.bands?.genres && setlist.bands.genres.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {setlist.bands.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
