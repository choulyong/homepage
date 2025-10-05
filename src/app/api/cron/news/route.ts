/**
 * Cron Job Endpoint - Daily News Crawling
 * 매일 자동으로 뉴스를 크롤링하는 API 엔드포인트
 *
 * 설정 방법:
 *
 * 1. Vercel 배포 (권장):
 *    - vercel.json에서 cron 스케줄이 설정되어 있습니다 (매일 오전 6시 KST)
 *    - Vercel Dashboard > Settings > Environment Variables에서 CRON_SECRET 추가
 *    - Vercel이 자동으로 매일 이 엔드포인트를 호출합니다
 *
 * 2. 외부 Cron 서비스 (cron-job.org, EasyCron 등):
 *    - URL: https://your-domain.com/api/cron/news
 *    - Method: GET
 *    - Headers: Authorization: Bearer YOUR_CRON_SECRET
 *    - Schedule: 0 21 * * * (매일 21:00 UTC = 오전 6시 KST)
 *
 * 3. 로컬 테스트:
 *    curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/news
 *
 * 보안: CRON_SECRET 환경변수로 인증
 */

import { NextRequest, NextResponse } from 'next/server';
import { crawlAllNews, crawlYouTubeVideos } from '@/app/actions/crawl';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // 보안: CRON_SECRET 환경변수로 인증
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    console.log(`[Cron Job] Starting daily crawl at ${new Date().toISOString()}`);

    // 1. 전체 뉴스 크롤링 실행
    const newsResult = await crawlAllNews();
    console.log(`[Cron Job] News crawl: ${newsResult.message}`);

    // 2. YouTube 영상 크롤링 실행
    const youtubeResult = await crawlYouTubeVideos();
    console.log(`[Cron Job] YouTube crawl: ${youtubeResult.message}`);

    if (newsResult.success || youtubeResult.success) {
      const message = `뉴스: ${newsResult.message}\nYouTube: ${youtubeResult.message}`;
      console.log(`[Cron Job] Success: ${message}`);
      return NextResponse.json({
        success: true,
        message: message,
        news: {
          count: newsResult.count,
          errors: newsResult.errors,
        },
        youtube: {
          count: youtubeResult.count,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      const errorMessage = `뉴스: ${newsResult.message}\nYouTube: ${youtubeResult.message}`;
      console.error(`[Cron Job] Failed: ${errorMessage}`);
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Cron Job] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
