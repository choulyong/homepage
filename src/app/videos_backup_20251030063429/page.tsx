/**
 * YouTube Videos Page - METALDRAGON Rock Community
 * Metal & Rock Top 100 뮤직비디오 및 공연 영상
 */

import prisma from '@/lib/prisma';
import VideosClient from './VideosClient';

export default async function VideosPage() {
  try {
    const videos = await prisma.youtubeVideo.findMany({
      orderBy: {
        published_at: 'desc'
      },
      take: 96 // 모든 비디오 표시
    });

    return <VideosClient initialVideos={videos} />;
  } catch (error) {
    console.error('비디오 데이터 가져오기 실패:', error);
    return <VideosClient initialVideos={[]} />;
  }
}
