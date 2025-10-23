/**
 * YouTube Videos Page - METALDRAGON Rock Community
 */

import { createClient } from '@/lib/supabase/server';

export default async function VideosPage() {
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from('youtube_videos')
    .select('*, band:bands(*)')
    .order('published_at', { ascending: false })
    .limit(24);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">📺 Rock Videos</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rock 명곡들의 뮤직비디오와 라이브 공연
          </p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-800"
              >
                <div className="aspect-video bg-black relative">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.band && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      {video.band.name}
                    </p>
                  )}
                  {video.channel_name && (
                    <p className="text-xs text-gray-500">
                      {video.channel_name}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              아직 등록된 비디오가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              곧 다양한 Rock 뮤직비디오가 추가될 예정입니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
