/**
 * Crawling Server Actions
 * YouTube RSS와 Google News RSS를 크롤링하여 자동으로 추가
 */

'use server';

import { createClient } from '@/lib/supabase/server';

// YouTube Channel ID (URL에서 추출 필요)
const YOUTUBE_CHANNEL_USERNAME = 'Metaldragon_82';

/**
 * YouTube RSS에서 최신 영상 크롤링
 */
export async function crawlYouTubeVideos() {
  try {
    // YouTube RSS Feed를 파싱하기 위해 Channel ID를 먼저 가져와야 합니다
    // @username 형식의 경우 직접 RSS를 사용할 수 없으므로
    // 간단한 방법: YouTube의 공개 API 없이 페이지 스크래핑

    // 임시 해결책: Channel ID를 하드코딩하거나 사용자에게 입력받기
    // 실제로는 YouTube Data API v3를 사용하는 것이 가장 정확합니다

    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?user=${YOUTUBE_CHANNEL_USERNAME}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('YouTube RSS를 가져올 수 없습니다');
    }

    const xmlText = await response.text();

    // XML 파싱 (간단한 정규식 사용)
    const videoMatches = xmlText.matchAll(
      /<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<published>(.*?)<\/published>[\s\S]*?<\/entry>/g
    );

    const supabase = await createClient();
    let addedCount = 0;

    for (const match of videoMatches) {
      const [, videoId, title, published] = match;

      // 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('video_id', videoId)
        .single();

      if (!existing) {
        // 새 영상 추가
        const { error } = await supabase.from('youtube_videos').insert({
          video_id: videoId,
          title: title.replace(/<!\[CDATA\[|\]\]>/g, ''),
          youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail_url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        });

        if (!error) {
          addedCount++;
        }
      }
    }

    return {
      success: true,
      message: `${addedCount}개의 새 영상을 추가했습니다.`,
      count: addedCount,
    };
  } catch (error: any) {
    console.error('YouTube 크롤링 에러:', error);
    return {
      success: false,
      message: error.message || 'YouTube 영상을 가져오는데 실패했습니다.',
    };
  }
}

/**
 * Google News RSS에서 IT 뉴스 크롤링
 */
export async function crawlITNews(category: 'ai' | 'crypto' = 'ai') {
  try {
    const searchQuery =
      category === 'ai'
        ? 'artificial intelligence OR machine learning OR AI'
        : 'cryptocurrency OR bitcoin OR blockchain OR crypto';

    const response = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=ko&gl=KR&ceid=KR:ko`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Google News RSS를 가져올 수 없습니다');
    }

    const xmlText = await response.text();

    // XML 파싱
    const itemMatches = xmlText.matchAll(
      /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<source.*?>(.*?)<\/source>[\s\S]*?<\/item>/g
    );

    const supabase = await createClient();
    let addedCount = 0;

    for (const match of itemMatches) {
      const [, title, link, pubDate, source] = match;

      // 중복 확인
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', link)
        .single();

      if (!existing && addedCount < 10) {
        // 최대 10개까지만 추가
        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const cleanSource = source.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

        const { error } = await supabase.from('news').insert({
          title: cleanTitle,
          url: link,
          category: category,
          source: cleanSource,
          published_at: new Date(pubDate).toISOString(),
        });

        if (!error) {
          addedCount++;
        }
      }
    }

    return {
      success: true,
      message: `${addedCount}개의 새 뉴스를 추가했습니다.`,
      count: addedCount,
    };
  } catch (error: any) {
    console.error('뉴스 크롤링 에러:', error);
    return {
      success: false,
      message: error.message || '뉴스를 가져오는데 실패했습니다.',
    };
  }
}

/**
 * YouTube Channel ID 가져오기 (API 없이)
 * 참고: 실제로는 YouTube Data API를 사용하는 것이 더 안정적입니다
 */
export async function getYouTubeChannelId(username: string) {
  try {
    const response = await fetch(`https://www.youtube.com/@${username}`, {
      cache: 'no-store',
    });

    const html = await response.text();

    // Channel ID 추출
    const match = html.match(/"channelId":"(.*?)"/);

    if (match && match[1]) {
      return {
        success: true,
        channelId: match[1],
      };
    }

    throw new Error('Channel ID를 찾을 수 없습니다');
  } catch (error: any) {
    console.error('Channel ID 추출 에러:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}
