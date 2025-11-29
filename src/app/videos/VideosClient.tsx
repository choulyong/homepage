'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  video_id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string;
  published_at: Date;
  created_at: Date;
}

interface Props {
  initialVideos: Video[];
}

export default function VideosClient({ initialVideos }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredVideos = searchQuery
    ? initialVideos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : initialVideos;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
          📺 Metal & Rock Videos
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          전설적인 Metal & Rock 밴드들의 대표곡 뮤직비디오와 공연 영상 ({filteredVideos.length}곡)
        </p>

        {/* 검색 */}
        <div className="max-w-xl">
          <input
            type="text"
            placeholder="밴드명이나 곡 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* YouTube 플레이어 (선택된 비디오) */}
      {selectedVideo && (
        <div className="mb-8 bg-black rounded-lg overflow-hidden shadow-2xl">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-4 bg-zinc-900">
            <h2 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h2>
            <button
              onClick={() => setSelectedVideo(null)}
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              ✕ 닫기
            </button>
          </div>
        </div>
      )}

      {/* 비디오 그리드 */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group text-left"
            >
              <Card
                hoverable
                padding="none"
                className="h-full overflow-hidden"
              >
                {/* 썸네일 */}
                <div className="aspect-video bg-black relative">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 제목 */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h3>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            검색 결과가 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            다른 검색어를 시도해보세요
          </p>
        </div>
      )}
    </div>
  );
}
