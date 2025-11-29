import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConcertDetail({ params }: Props) {
  const { id } = await params;
  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { band: true },
  });

  if (!concert) notFound();

  const getVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^#&?]*)/);
    return match?.[1];
  };

  const videoId = getVideoId(concert.youtube_url);
  const setlist = concert.setlist as { songs?: string[] } | null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/concerts" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-8">
          Back to Concerts
        </Link>

        <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-2xl p-8 mb-8 border border-amber-500/20">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">{concert.title}</span>
          </h1>

          <div className="flex items-center gap-3 mb-6">
            {concert.band?.logo_url && (
              <img src={concert.band.logo_url} alt={concert.band.name} className="w-12 h-12 rounded-full object-cover" />
            )}
            <Link href={`/bands/${concert.band_id}`} className="text-2xl font-bold text-red-600 dark:text-red-400">
              {concert.band?.name}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span>📍</span>
              <div>
                <p className="font-semibold">{concert.venue}</p>
                <p className="text-sm">{concert.location}</p>
                {concert.city && <p className="text-sm">{concert.city}, {concert.country}</p>}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span>📅</span>
              <div>
                <p className="font-semibold">{new Date(concert.date).toLocaleDateString('ko-KR')}</p>
                <p className="text-sm">{concert.past_event ? 'Past Concert' : 'Upcoming'}</p>
              </div>
            </div>
          </div>

          {concert.description && (
            <div className="mt-6 p-4 bg-white/50 dark:bg-zinc-900/50 rounded-lg">
              <p>{concert.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {videoId ? (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-2xl overflow-hidden">
                  <div className="relative" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={concert.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <a
                  href={concert.youtube_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  ▶ Watch on YouTube
                </a>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl p-12 text-center">
                <p className="text-6xl mb-4">🎤</p>
                <p className="text-xl text-gray-400">Video coming soon</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🎵</span>
                <span className="gradient-text">Setlist</span>
              </h2>

              {setlist?.songs && setlist.songs.length > 0 ? (
                <div className="space-y-3">
                  {setlist.songs.map((song, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-zinc-900/50 rounded-lg">
                      <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium">{song}</span>
                    </div>
                  ))}
                  <div className="mt-6 pt-6 border-t border-purple-500/20 text-center text-sm">
                    Total: <span className="font-bold text-purple-600">{setlist.songs.length}</span> songs
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">🎸</p>
                  <p>No setlist available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
