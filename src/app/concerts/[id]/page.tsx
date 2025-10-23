/**
 * Concert Detail Page - METALDRAGON Rock Community
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface ConcertDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConcertDetailPage({ params }: ConcertDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: concert } = await supabase
    .from('concerts')
    .select('*, band:bands(*)')
    .eq('id', id)
    .single();

  if (!concert) notFound();

  const { data: reviews } = await supabase
    .from('concert_reviews')
    .select('*')
    .eq('concert_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/concerts" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-500 mb-8">
          ← Back to Concerts
        </Link>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 mb-8">
          <div className="text-6xl mb-6 text-center">🎤</div>
          <h1 className="text-4xl font-display font-bold mb-4 text-center">
            <span className="gradient-text">{concert.title}</span>
          </h1>
          <Link href={`/bands/${concert.band?.id}`} className="text-2xl text-center block text-red-600 dark:text-red-400 hover:text-red-500 mb-6">
            {concert.band?.name}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Venue</h3>
                <p className="text-xl">{concert.venue}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Location</h3>
                <p className="text-xl">{concert.city}, {concert.country}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Date</h3>
                <p className="text-xl">{new Date(concert.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}</p>
              </div>
              {concert.ticket_url && (
                <a
                  href={concert.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  🎫 Get Tickets
                </a>
              )}
            </div>
          </div>

          {concert.description && (
            <div className="mt-6 p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{concert.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Concert Reviews ({reviews?.length || 0})</h2>
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
            <p className="text-gray-500">아직 리뷰가 없습니다. 콘서트 후 리뷰를 남겨주세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
