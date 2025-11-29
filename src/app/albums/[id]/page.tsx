/**
 * Album Detail Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  // Fetch album with band and tracks from local PostgreSQL via Prisma
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      band: true,
      tracks: {
        orderBy: {
          track_number: 'asc',
        },
      },
    },
  });

  if (!album) notFound();

  const tracks = album.tracks;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/albums" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 mb-8">
          ← Back to Albums
        </Link>

        <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 h-64 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {album.cover_url ? (
                <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-8xl">💿</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold mb-4">
                <span className="gradient-text">{album.title}</span>
              </h1>
              <Link href={`/bands/${album.band?.id}`} className="text-xl text-gray-700 dark:text-gray-300 hover:text-red-500 mb-4 block">
                🎸 {album.band?.name}
              </Link>
              {album.release_year && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">📅 {album.release_year}</p>
              )}
              {album.label && (
                <p className="text-gray-600 dark:text-gray-400">🏷️ {album.label}</p>
              )}
            </div>
          </div>
        </div>

        {/* Track List / Set List */}
        {tracks && tracks.length > 0 ? (
          <div className="mb-8 bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎵</span>
                <div>
                  <h2 className="text-3xl font-display font-bold">Set List</h2>
                  <p className="text-gray-600 dark:text-gray-400">{tracks.length} tracks • {Math.floor(tracks.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) / 60)} min</p>
                </div>
              </div>
              {album.spotify_url && (
                <a
                  href={album.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
                  title="Play on Spotify"
                >
                  <span className="text-xl">▶</span>
                  <span>Play on Spotify</span>
                </a>
              )}
            </div>

            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-b border-amber-500/30 font-semibold text-sm text-gray-700 dark:text-gray-300">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Track Title</div>
                <div className="col-span-2 text-center">Duration</div>
                <div className="col-span-2 text-center">Preview</div>
              </div>

              {/* Track Rows */}
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="grid grid-cols-12 gap-4 py-4 px-4 hover:bg-amber-500/10 transition-colors group border-b border-gray-200 dark:border-zinc-800 last:border-0"
                >
                  <div className="col-span-1 text-center">
                    <span className="text-gray-400 dark:text-gray-600 font-bold group-hover:text-amber-500 transition-colors">
                      {track.track_number}
                    </span>
                  </div>
                  <div className="col-span-7">
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {track.title}
                    </span>
                    {track.spotify_id && (
                      <a
                        href={`https://open.spotify.com/track/${track.spotify_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-green-600 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open in Spotify"
                      >
                        🔗 Spotify
                      </a>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    {track.duration_seconds ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    {track.preview_url ? (
                      <a
                        href={track.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-500 text-white rounded-full transition-all hover:scale-110"
                        title="30s Preview"
                      >
                        ▶
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Album Statistics */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {tracks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(tracks.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) / 60)} min
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Duration</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {tracks.filter(t => t.preview_url).length}/{tracks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Previews Available</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              🎵 Track list is being loaded from Spotify...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
