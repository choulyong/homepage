import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 모든 뉴스 가져오기 (최신순 정렬)
    const news = await prisma.news.findMany({
      orderBy: {
        published_at: 'desc',
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('뉴스 API 에러:', error);
    return NextResponse.json(
      { error: '뉴스를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
