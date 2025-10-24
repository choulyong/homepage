'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Band {
  id: string;
  name: string;
  logo_url: string | null;
  genres: string[];
}

interface Setlist {
  id: string;
  band_id: string;
  concert_id: string | null;
  title: string;
  venue: string | null;
  event_date: string | null;
  description: string | null;
  created_at: string;
  bands: Band;
}

interface SetlistSong {
  id: string;
  setlist_id: string;
  song_title: string;
  song_order: number;
  duration_seconds: number | null;
  notes: string | null;
  is_encore: boolean;
}

export default function SetlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [songs, setSongs] = useState<SetlistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchSetlistDetail(params.id as string);
    }
  }, [params.id]);

  async function fetchSetlistDetail(id: string, isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch setlist
      const { data: setlistData, error: setlistError } = await supabase
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
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (setlistError) {
        console.error('Error fetching setlist:', setlistError);
        router.push('/setlists');
        return;
      }

      setSetlist(setlistData);

      // Fetch songs
      const { data: songsData, error: songsError } = await supabase
        .from('setlist_songs')
        .select('*')
        .eq('setlist_id', id)
        .order('song_order', { ascending: true });

      if (songsError) {
        console.error('Error fetching songs:', songsError);
      } else {
        setSongs(songsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    if (params.id) {
      await fetchSetlistDetail(params.id as string, true);
    }
  }

  function formatDuration(seconds: number | null): string {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getTotalDuration(): string {
    const total = songs.reduce((sum, song) => sum + (song.duration_seconds || 0), 0);
    if (total === 0) return '';
    const mins = Math.floor(total / 60);
    return `${mins} min`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading setlist...</div>
      </div>
    );
  }

  if (!setlist) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Setlist not found</div>
      </div>
    );
  }

  const mainSongs = songs.filter((s) => !s.is_encore);
  const encoreSongs = songs.filter((s) => s.is_encore);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/setlists"
              className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Setlists
            </Link>
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

          {/* Band Info */}
          <div className="flex items-center space-x-4 mb-4">
            {setlist.bands?.logo_url ? (
              <img
                src={setlist.bands.logo_url}
                alt={setlist.bands.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                🎸
              </div>
            )}
            <div>
              <Link
                href={`/bands/${setlist.bands?.id}`}
                className="text-xl font-semibold text-red-500 hover:text-red-400 transition-colors"
              >
                {setlist.bands?.name || 'Unknown Band'}
              </Link>
              {setlist.bands?.genres && setlist.bands.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {setlist.bands.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{setlist.title}</h1>

          <div className="flex flex-wrap gap-4 text-zinc-400">
            {setlist.venue && (
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {setlist.venue}
              </div>
            )}
            {setlist.event_date && (
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                {new Date(setlist.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
            <div className="flex items-center">
              <span className="mr-2">🎵</span>
              {songs.length} songs
            </div>
            {getTotalDuration() && (
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                {getTotalDuration()}
              </div>
            )}
          </div>

          {setlist.description && (
            <p className="mt-4 text-zinc-300">{setlist.description}</p>
          )}
        </div>
      </div>

      {/* Setlist */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {songs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">No songs in this setlist yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Set */}
            {mainSongs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Main Set</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {mainSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="border-b border-zinc-800 last:border-b-0 p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-zinc-500 font-mono text-sm w-8 flex-shrink-0 pt-1">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">{song.song_title}</div>
                            {song.notes && (
                              <div className="text-sm text-zinc-400 mt-1">{song.notes}</div>
                            )}
                          </div>
                        </div>
                        {song.duration_seconds && (
                          <div className="text-zinc-400 text-sm ml-4">
                            {formatDuration(song.duration_seconds)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encore */}
            {encoreSongs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Encore</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {encoreSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="border-b border-zinc-800 last:border-b-0 p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-red-500 font-mono text-sm w-8 flex-shrink-0 pt-1">
                            E{String(index + 1).padStart(1, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">{song.song_title}</div>
                            {song.notes && (
                              <div className="text-sm text-zinc-400 mt-1">{song.notes}</div>
                            )}
                          </div>
                        </div>
                        {song.duration_seconds && (
                          <div className="text-zinc-400 text-sm ml-4">
                            {formatDuration(song.duration_seconds)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
