/**
 * Crawling Server Actions
 * YouTube RSS와 Google News RSS를 크롤링하여 자동으로 추가
 */

'use server';

import { createClient } from '@/lib/supabase/server';

// YouTube Channel ID
// Channel ID를 사용하는 것이 가장 안정적입니다
// Channel ID 찾는 법:
// 1. YouTube 채널 페이지에서 "채널 정보" 탭 클릭
// 2. "공유" 클릭하여 URL에서 channel_id 확인
// 3. 또는 아래 getYouTubeChannelId 함수 사용
const YOUTUBE_CHANNEL_ID = 'UCs2Tc_WvHSbqTf_qGAWNaqw'; // Metaldragon YouTube Channel

/**
 * YouTube API에서 전체 영상 크롤링 (최대 500개)
 * YouTube Data API v3 사용
 */
export async function crawlYouTubeVideos() {
  try {
    // Channel ID가 설정되지 않은 경우
    if (YOUTUBE_CHANNEL_ID === 'UCYour_Channel_ID_Here') {
      throw new Error('YouTube Channel ID를 설정해주세요. crawl.ts 파일의 YOUTUBE_CHANNEL_ID 변수를 수정하세요.');
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;

    // API KEY가 없으면 RSS Feed 사용 (최근 15개만)
    if (!API_KEY) {
      return await crawlYouTubeVideosRSS();
    }

    const supabase = await createClient();
    let addedCount = 0;
    let pageToken = '';
    let totalFetched = 0;
    const MAX_RESULTS = 50; // 한 번에 가져올 영상 수 (최대 50)
    const MAX_PAGES = 10; // 최대 페이지 수 (총 500개까지)

    // 여러 페이지에 걸쳐 영상 가져오기
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('channelId', YOUTUBE_CHANNEL_ID);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('order', 'date');
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', MAX_RESULTS.toString());
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url.toString(), { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`YouTube API 오류 (Status: ${response.status})`);
      }

      const data = await response.json();

      // 영상 처리
      for (const item of data.items || []) {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const publishedAt = item.snippet.publishedAt;

        // 중복 확인
        const { data: existing } = await supabase
          .from('youtube_videos')
          .select('id')
          .eq('video_id', videoId)
          .single();

        if (!existing) {
          const { error } = await supabase.from('youtube_videos').insert({
            video_id: videoId,
            title: title,
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail_url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            published_at: publishedAt,
          });

          if (!error) {
            addedCount++;
          }
        }
      }

      totalFetched += data.items?.length || 0;

      // 다음 페이지가 없으면 종료
      if (!data.nextPageToken) {
        break;
      }

      pageToken = data.nextPageToken;
    }

    return {
      success: true,
      message: `${addedCount}개의 새 영상을 추가했습니다. (총 ${totalFetched}개 확인)`,
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
 * YouTube RSS에서 최신 영상 크롤링 (최대 15개)
 * API KEY가 없을 때 대체 수단
 */
async function crawlYouTubeVideosRSS() {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`YouTube RSS를 가져올 수 없습니다 (Status: ${response.status})`);
    }

    const xmlText = await response.text();
    const videoMatches = xmlText.matchAll(
      /<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<published>(.*?)<\/published>[\s\S]*?<\/entry>/g
    );

    const supabase = await createClient();
    let addedCount = 0;

    for (const match of videoMatches) {
      const [, videoId, title, published] = match;

      const { data: existing } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('video_id', videoId)
        .single();

      if (!existing) {
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
      message: `${addedCount}개의 새 영상을 추가했습니다. (RSS Feed - 최근 15개만 지원)`,
      count: addedCount,
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * 다양한 분야의 공신력 있는 RSS Feed 목록
 */
const RSS_FEEDS = {
  technology: [
    { name: '네이버 IT/과학', url: 'https://news.naver.com/rss/digital.xml', category: 'tech' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  ],
  business: [
    { name: '네이버 경제', url: 'https://news.naver.com/rss/economy.xml', category: 'business' },
    { name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', category: 'business' },
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'business' },
    { name: 'Google News Business', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'business' },
  ],
  world: [
    { name: '네이버 세계', url: 'https://news.naver.com/rss/world.xml', category: 'world' },
    { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'world' },
    { name: 'Google News World', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'world' },
  ],
  science: [
    { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
  ],
  ai: [
    { name: 'Google News AI', url: 'https://news.google.com/rss/search?q=artificial+intelligence+OR+AI+OR+machine+learning&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  ],
  korea: [
    { name: '네이버 뉴스 메인', url: 'https://news.naver.com/rss/index.xml', category: 'korea' },
    { name: '네이버 정치', url: 'https://news.naver.com/rss/politics.xml', category: 'korea' },
    { name: '네이버 사회', url: 'https://news.naver.com/rss/society.xml', category: 'korea' },
    { name: 'Google News Korea', url: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko', category: 'korea' },
  ],
};

/**
 * 단일 RSS Feed 크롤링
 */
async function crawlSingleFeed(feedUrl: string, feedName: string, category: string, limit: number = 5) {
  try {
    const response = await fetch(feedUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${feedName}: ${response.status}`);
      return { added: 0, errors: 1 };
    }

    const xmlText = await response.text();
    const supabase = await createClient();
    let addedCount = 0;

    // RSS 2.0 형식 파싱
    const itemMatches = xmlText.matchAll(
      /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?(?:<pubDate>(.*?)<\/pubDate>)?[\s\S]*?(?:<description>(.*?)<\/description>)?[\s\S]*?<\/item>/g
    );

    for (const match of itemMatches) {
      if (addedCount >= limit) break;

      const [, title, link, pubDate, description] = match;

      // 중복 확인
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', link)
        .single();

      if (!existing) {
        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').trim();
        const cleanDescription = description
          ? description.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').trim().substring(0, 500)
          : '';

        const { error } = await supabase.from('news').insert({
          title: cleanTitle,
          description: cleanDescription,
          url: link,
          source: feedName,
          category: category,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });

        if (!error) {
          addedCount++;
        }
      }
    }

    return { added: addedCount, errors: 0 };
  } catch (error: any) {
    console.error(`RSS 크롤링 에러 (${feedName}):`, error.message);
    return { added: 0, errors: 1 };
  }
}

/**
 * 모든 카테고리의 뉴스 크롤링
 */
export async function crawlAllNews() {
  try {
    let totalAdded = 0;
    let totalErrors = 0;
    const results: string[] = [];

    // 모든 RSS Feed 크롤링
    for (const [categoryName, feeds] of Object.entries(RSS_FEEDS)) {
      for (const feed of feeds) {
        const result = await crawlSingleFeed(feed.url, feed.name, feed.category, 5);
        totalAdded += result.added;
        totalErrors += result.errors;

        if (result.added > 0) {
          results.push(`${feed.name}: ${result.added}개 추가`);
        }
      }
    }

    return {
      success: true,
      message: `총 ${totalAdded}개의 새 뉴스를 추가했습니다.\n${results.join('\n')}`,
      count: totalAdded,
      errors: totalErrors,
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
 * 특정 카테고리의 뉴스만 크롤링
 */
export async function crawlNewsByCategory(categoryName: keyof typeof RSS_FEEDS) {
  try {
    const feeds = RSS_FEEDS[categoryName];
    if (!feeds) {
      throw new Error(`존재하지 않는 카테고리입니다: ${categoryName}`);
    }

    let totalAdded = 0;
    const results: string[] = [];

    for (const feed of feeds) {
      const result = await crawlSingleFeed(feed.url, feed.name, feed.category, 10);
      totalAdded += result.added;

      if (result.added > 0) {
        results.push(`${feed.name}: ${result.added}개 추가`);
      }
    }

    return {
      success: true,
      message: `${totalAdded}개의 새 뉴스를 추가했습니다.\n${results.join('\n')}`,
      count: totalAdded,
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
 * username 또는 채널 URL로 Channel ID 추출
 */
export async function getYouTubeChannelId(usernameOrUrl: string) {
  try {
    // URL이 아닌 경우 @username 형식으로 변환
    let channelUrl = usernameOrUrl;
    if (!usernameOrUrl.startsWith('http')) {
      channelUrl = `https://www.youtube.com/@${usernameOrUrl}`;
    }

    const response = await fetch(channelUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`채널 페이지를 가져올 수 없습니다 (Status: ${response.status})`);
    }

    const html = await response.text();

    // Channel ID 추출 (여러 패턴 시도)
    const patterns = [
      /"channelId":"(UC[\w-]{22})"/,
      /"externalChannelId":"(UC[\w-]{22})"/,
      /channel\/(UC[\w-]{22})/,
      /"browseId":"(UC[\w-]{22})"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return {
          success: true,
          channelId: match[1],
          message: `Channel ID: ${match[1]}`,
        };
      }
    }

    throw new Error('Channel ID를 찾을 수 없습니다. 채널 URL이나 username이 올바른지 확인해주세요.');
  } catch (error: any) {
    console.error('Channel ID 추출 에러:', error);
    return {
      success: false,
      message: error.message,
      channelId: null,
    };
  }
}
