/**
 * Album Detail Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from('albums')
    .select('*, band:bands(*)')
    .eq('id', id)
    .single();

  if (!album) notFound();

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('album_id', id)
    .order('track_number', { ascending: true });

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('album_id', id)
    .order('created_at', { ascending: false });

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

        {tracks && tracks.length > 0 && (
          <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Track List</h2>
            <div className="space-y-2">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-zinc-800 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 w-8">{track.track_number}</span>
                    <span className="font-medium">{track.title}</span>
                  </div>
                  {track.duration_seconds && (
                    <span className="text-sm text-gray-500">
                      {Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Reviews ({reviews?.length || 0})</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 dark:border-zinc-800 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-amber-500">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
