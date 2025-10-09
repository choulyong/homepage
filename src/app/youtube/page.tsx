/**
 * YouTube Cover Page with Tailwind CSS
 * YouTube 커버 영상 목록
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { crawlYouTubeVideos } from '@/app/actions/crawl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SortOrder = 'newest' | 'oldest';

export default function YouTubePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<{ [key: string]: number }>({});

  const getThumbnailUrl = (videoId: string) => {
    const errorLevel = imgErrors[videoId] || 0;

    // 0: maxresdefault, 1: hqdefault, 2: mqdefault
    const thumbnails = [
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    ];

    return thumbnails[errorLevel] || thumbnails[2];
  };

  const handleImageError = (videoId: string) => {
    setImgErrors((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || 0) + 1,
    }));
  };

  const loadVideos = useCallback(async () => {
    const supabase = createClient();

    const { data: videosData } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('published_at', { ascending: sortOrder === 'oldest' });

    setVideos(videosData || []);
    setLoading(false);
  }, [sortOrder]);

  const handleRefresh = async () => {
    setCrawling(true);
    setMessage(null);

    try {
      const result = await crawlYouTubeVideos();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadVideos();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '크롤링에 실패했습니다.' });
    } finally {
      setCrawling(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedVideo]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
              YouTube 커버 영상
            </h1>
            <p className="text-lg text-gray-600 dark:text-white">
              노래 커버와 연주 영상을 공유합니다
            </p>
          </div>
          <Button variant="primary" onClick={handleRefresh} disabled={crawling}>
            {crawling ? '🔄 새로고침 중...' : '🔄 새로고침'}
          </Button>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortOrder('newest')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              sortOrder === 'newest'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            최신순
          </button>
          <button
            onClick={() => setSortOrder('oldest')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              sortOrder === 'oldest'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            오래된순
          </button>
        </div>

        {message && (
          <div
            className={cn(
              'p-4 rounded-md mb-4 border whitespace-pre-wrap',
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500 text-green-500'
                : 'bg-red-500/10 border-red-500 text-red-500'
            )}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Video Grid */}
      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video.video_id)}
              className="group cursor-pointer"
            >
              <Card
                hoverable
                padding="none"
                className="overflow-hidden h-full flex flex-col"
              >
                {/* Video Thumbnail with 16:9 aspect ratio */}
                <div className="relative w-full pb-[56.25%] bg-gray-800 dark:bg-gray-900 overflow-hidden">
                  <Image
                    key={`${video.video_id}-${imgErrors[video.video_id] || 0}`}
                    src={getThumbnailUrl(video.video_id)}
                    alt={video.title}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(video.video_id)}
                  />

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
                    <div className="text-sm text-gray-500 dark:text-gray-100 mt-auto">
                      {new Date(video.published_at).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            아직 영상이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-white">
            곧 멋진 커버 영상을 업로드할 예정입니다!
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-6xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* YouTube iframe */}
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
