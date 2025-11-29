/**
 * News Page - METALDRAGON Rock Community
 * 록/메탈 음악 뉴스 및 오디오 장비 소식
 */

import NewsClient from './NewsClient';
import prisma from '@/lib/prisma';

// ISR: 페이지를 60초마다 재생성
export const revalidate = 60;

export default async function NewsPage() {
  try {
    // Prisma로 최신 뉴스 200개만 가져오기 (최신순 정렬)
    const allNews = await prisma.news.findMany({
      take: 200,
      orderBy: {
        published_at: 'desc'
      },
    });

    return <NewsClient initialNews={allNews} />;
  } catch (error) {
    console.error('뉴스 데이터 가져오기 실패:', error);
    // 에러 발생 시 빈 배열 반환
    return <NewsClient initialNews={[]} />;
  }
}
