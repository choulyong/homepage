/**
 * Band Detail Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface BandDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BandDetailPage({ params }: BandDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: band, error } = await supabase
    .from('bands')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !band) {
    notFound();
  }

  // Fetch albums
  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .eq('band_id', id)
    .order('release_year', { ascending: false });

  // Fetch band members
  const { data: members } = await supabase
    .from('band_members')
    .select(`
      *,
      artist:artists(*)
    `)
    .eq('band_id', id)
    .order('join_year', { ascending: false });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/bands"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Bands
        </Link>

        {/* Band Header */}
        <div className="bg-gradient-to-br from-red-500/10 to-amber-500/10 dark:from-red-900/20 dark:to-amber-900/20 rounded-2xl p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Band Logo */}
            <div className="w-full md:w-64 h-64 bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {band.logo_url ? (
                <img
                  src={band.logo_url}
                  alt={band.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-8xl">🎸</span>
              )}
            </div>

            {/* Band Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                <span className="gradient-text">{band.name}</span>
              </h1>

              <div className="space-y-2 mb-6">
                {band.country && (
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    📍 {band.country}
                  </p>
                )}
                {band.formed_year && (
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    📅 Formed in {band.formed_year}
                  </p>
                )}
              </div>

              {band.genres && Array.isArray(band.genres) && band.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {band.genres.map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {band.bio && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {band.bio}
                </p>
              )}

              {/* Social Links */}
              {band.social_links && typeof band.social_links === 'object' && (
                <div className="flex gap-4 mt-6">
                  {Object.entries(band.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Albums Section */}
        {albums && albums.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              💿 Discography
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-zinc-800"
                >
                  <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">💿</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {album.title}
                    </h3>
                    {album.release_year && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {album.release_year}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Band Members Section */}
        {members && members.length > 0 && (
          <div>
            <h2 className="text-3xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              👥 Band Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md border border-gray-200 dark:border-zinc-800"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.artist?.name || 'Unknown Artist'}
                  </h3>
                  {member.position && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      🎵 {member.position}
                    </p>
                  )}
                  {member.join_year && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Joined: {member.join_year}
                      {member.leave_year && ` - Left: ${member.leave_year}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
