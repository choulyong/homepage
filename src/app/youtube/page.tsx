/**
 * YouTube Cover Page with Tailwind CSS
 * YouTube 커버 영상 목록
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function YouTubePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      const supabase = createClient();

      const { data: videosData } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: false });

      setVideos(videosData || []);
      setLoading(false);
    };

    loadVideos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
          YouTube 커버 영상
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          노래 커버와 연주 영상을 공유합니다
        </p>
      </div>

      {/* Video Grid */}
      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card
                hoverable
                padding="none"
                className="overflow-hidden h-full flex flex-col"
              >
                {/* Video Thumbnail with 16:9 aspect ratio */}
                <div className="relative w-full pb-[56.25%] bg-gray-800 dark:bg-gray-900 overflow-hidden">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20" />
                  )}

                  {/* YouTube Play Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68px] h-[48px] bg-red-600/80 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:bg-red-600 group-hover:scale-110">
                    {/* Play icon triangle */}
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {video.title}
                  </h3>

                  {video.published_at && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-auto">
                      {new Date(video.published_at).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            아직 영상이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            곧 멋진 커버 영상을 업로드할 예정입니다!
          </p>
        </div>
      )}
    </div>
  );
}
