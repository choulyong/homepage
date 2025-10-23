/**
 * Crawling Server Actions
 * YouTube RSS와 Google News RSS를 크롤링하여 자동으로 추가
 */

'use server';

import { createServiceClient } from '@/lib/supabase/server';

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
    console.log('\n🎬 ========== YouTube 크롤링 시작 ==========');
    // Channel ID가 설정되지 않은 경우
    if (YOUTUBE_CHANNEL_ID === 'UCYour_Channel_ID_Here') {
      throw new Error('YouTube Channel ID를 설정해주세요. crawl.ts 파일의 YOUTUBE_CHANNEL_ID 변수를 수정하세요.');
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    console.log(`🔑 API KEY 존재 여부: ${API_KEY ? '✅ 있음' : '❌ 없음 (RSS 사용)'}`);

    // API KEY가 없으면 RSS Feed 사용 (최근 15개만)
    if (!API_KEY) {
      console.log('📡 RSS Feed로 크롤링합니다...');
      return await crawlYouTubeVideosRSS();
    }

    const supabase = createServiceClient();
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    let pageToken = '';
    let totalFetched = 0;
    const MAX_RESULTS = 50; // 한 번에 가져올 영상 수 (최대 50)
    const MAX_PAGES = 10; // 최대 페이지 수 (총 500개까지)

    console.log(`📺 채널 ID: ${YOUTUBE_CHANNEL_ID}`);
    console.log(`📊 최대 ${MAX_PAGES}페이지 (페이지당 ${MAX_RESULTS}개) 크롤링 예정\n`);

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

      console.log(`📄 페이지 ${page + 1} 요청 중...`);
      const response = await fetch(url.toString(), { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`YouTube API 오류 (Status: ${response.status})`);
      }

      const data = await response.json();
      const itemCount = data.items?.length || 0;
      console.log(`   ✓ ${itemCount}개 영상 받음`);

      // 첫 5개 영상만 상세 로그
      if (page === 0 && itemCount > 0) {
        console.log('\n📋 최신 영상 5개:');
        for (let i = 0; i < Math.min(5, itemCount); i++) {
          const item = data.items[i];
          console.log(`   ${i + 1}. ${item.snippet.title}`);
          console.log(`      ID: ${item.id.videoId}`);
          console.log(`      게시일: ${new Date(item.snippet.publishedAt).toLocaleString('ko-KR')}`);
        }
        console.log('');
      }

      // 영상 처리
      for (const item of data.items || []) {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const publishedAt = item.snippet.publishedAt;

        // 중복 확인 (maybeSingle 사용)
        const { data: existing, error: checkError } = await supabase
          .from('youtube_videos')
          .select('id')
          .eq('video_id', videoId)
          .maybeSingle();

        if (checkError) {
          console.error(`❌ 중복 체크 에러 (${videoId}):`, checkError);
          errorCount++;
          continue;
        }

        if (!existing) {
          const { error: insertError } = await supabase.from('youtube_videos').insert({
            video_id: videoId,
            title: title,
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            published_at: publishedAt,
          });

          if (!insertError) {
            addedCount++;
            console.log(`✅ 새 영상 추가: ${title}`);
          } else {
            console.error(`❌ 영상 추가 실패 (${videoId}):`, insertError);
            errorCount++;
          }
        } else {
          duplicateCount++;
        }
      }

      totalFetched += data.items?.length || 0;

      // 다음 페이지가 없으면 종료
      if (!data.nextPageToken) {
        console.log(`\n⏹️  마지막 페이지 (페이지 ${page + 1})`);
        break;
      }

      pageToken = data.nextPageToken;
    }

    console.log('\n📊 ========== 크롤링 완료 ==========');
    console.log(`   ✅ 새로 추가: ${addedCount}개`);
    console.log(`   ⏭️  중복 스킵: ${duplicateCount}개`);
    console.log(`   ❌ 에러: ${errorCount}개`);
    console.log(`   📊 총 확인: ${totalFetched}개`);
    console.log('========================================\n');

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

    const supabase = createServiceClient();
    let addedCount = 0;
    let duplicateCount = 0;
    const videos = Array.from(videoMatches);

    console.log(`📺 RSS에서 ${videos.length}개 영상 발견\n`);

    for (const match of videos) {
      const [, videoId, title, published] = match;
      const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '');

      const { data: existing, error: checkError } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('video_id', videoId)
        .maybeSingle();

      if (checkError) {
        console.error(`❌ 중복 체크 에러 (${videoId}):`, checkError);
        continue;
      }

      if (!existing) {
        const { error: insertError } = await supabase.from('youtube_videos').insert({
          video_id: videoId,
          title: cleanTitle,
          youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          published_at: published,
        });

        if (!insertError) {
          addedCount++;
          console.log(`✅ 새 영상 추가 (RSS): ${cleanTitle}`);
        } else {
          console.error(`❌ 영상 추가 실패 (${videoId}):`, insertError);
        }
      } else {
        duplicateCount++;
        console.log(`⏭️  중복 스킵: ${cleanTitle.substring(0, 60)}...`);
      }
    }

    console.log(`\n📊 RSS 크롤링 완료: 추가 ${addedCount}개 / 중복 ${duplicateCount}개`)

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
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  ],
  business: [
    { name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', category: 'business' },
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'business' },
    { name: 'Google News Business', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'business' },
  ],
  economy: [
    { name: 'Google News 경제', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'economy' },
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/feed/podcast/bloomberg-markets.xml', category: 'economy' },
  ],
  entertainment: [
    { name: 'Google News 연예', url: 'https://news.google.com/rss/search?q=연예+OR+연예인+OR+아이돌&hl=ko&gl=KR&ceid=KR:ko', category: 'entertainment' },
    { name: 'Variety', url: 'https://variety.com/feed/', category: 'entertainment' },
  ],
  movie: [
    { name: 'Google News 영화', url: 'https://news.google.com/rss/search?q=영화+OR+극장+OR+박스오피스&hl=ko&gl=KR&ceid=KR:ko', category: 'movie' },
    { name: 'IMDb News', url: 'https://www.imdb.com/news/rss/', category: 'movie' },
    { name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'movie' },
  ],
  sports: [
    { name: 'Google News 스포츠', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'sports' },
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
  ],
  world: [
    { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'world' },
    { name: 'Google News World', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko', category: 'world' },
  ],
  science: [
    { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
    { name: 'Google News 과학', url: 'https://news.google.com/rss/search?q=과학+OR+연구&hl=ko&gl=KR&ceid=KR:ko', category: 'science' },
  ],
  health: [
    { name: 'Google News 건강', url: 'https://news.google.com/rss/search?q=건강+OR+의학+OR+질병&hl=ko&gl=KR&ceid=KR:ko', category: 'health' },
    { name: 'WebMD Health', url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', category: 'health' },
    { name: 'NIH News', url: 'https://www.nih.gov/news-events/news-releases/rss', category: 'health' },
  ],
  culture: [
    { name: 'Google News 문화', url: 'https://news.google.com/rss/search?q=문화+OR+예술+OR+전시&hl=ko&gl=KR&ceid=KR:ko', category: 'culture' },
  ],
  ai: [
    { name: 'Google News AI', url: 'https://news.google.com/rss/search?q=artificial+intelligence+OR+AI+OR+machine+learning&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  ],
  korea: [
    { name: 'Google News Korea', url: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko', category: 'korea' },
  ],
};

/**
 * 단일 RSS Feed 크롤링
 */
async function crawlSingleFeed(feedUrl: string, feedName: string, category: string, limit: number = 5) {
  try {
    console.log(`\n🔍 크롤링 시작: ${feedName} (${category})`);
    console.log(`📡 URL: ${feedUrl}`);

    const response = await fetch(feedUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Fetch 실패 ${feedName}: ${response.status}`);
      return { added: 0, errors: 1 };
    }

    const xmlText = await response.text();
    console.log(`📄 XML 길이: ${xmlText.length} bytes`);

    const supabase = createServiceClient();
    let addedCount = 0;

    // RSS 2.0 형식 파싱
    const itemMatches = xmlText.matchAll(
      /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?(?:<pubDate>(.*?)<\/pubDate>)?[\s\S]*?(?:<description>(.*?)<\/description>)?[\s\S]*?<\/item>/g
    );

    const items = Array.from(itemMatches);
    console.log(`📰 발견된 아이템 수: ${items.length}`);

    for (const match of items) {
      if (addedCount >= limit) break;

      const [, title, link, pubDate, description] = match;

      // 중복 확인 (maybeSingle 사용)
      const { data: existing, error: checkError } = await supabase
        .from('news')
        .select('id')
        .eq('url', link)
        .maybeSingle();

      if (checkError) {
        console.error(`❌ 중복 체크 에러:`, checkError);
        continue;
      }

      if (!existing) {
        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').trim();
        const cleanDescription = description
          ? description.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').trim().substring(0, 500)
          : '';

        const { error: insertError } = await supabase.from('news').insert({
          title: cleanTitle,
          description: cleanDescription,
          url: link,
          source: feedName,
          category: category,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });

        if (!insertError) {
          addedCount++;
          console.log(`✅ 추가: ${cleanTitle.substring(0, 50)}...`);
        } else {
          console.error(`❌ 추가 실패:`, insertError);
        }
      } else {
        console.log(`⏭️  중복: ${title.replace(/<!\[CDATA\[|\]\]>|<[^>]*>/g, '').trim().substring(0, 50)}...`);
      }
    }

    console.log(`✨ ${feedName} 완료: ${addedCount}개 추가\n`);
    return { added: addedCount, errors: 0 };
  } catch (error: any) {
    console.error(`❌ RSS 크롤링 에러 (${feedName}):`, error.message);
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

/**
 * 모든 YouTube 썸네일 URL을 hqdefault.jpg로 업데이트
 * maxresdefault.jpg는 일부 영상에서 404 오류 발생
 */
export async function fixYouTubeThumbnails() {
  try {
    console.log('\n🔧 ========== 썸네일 URL 수정 시작 ==========');

    const supabase = createServiceClient();

    // maxresdefault.jpg 사용하는 영상 개수 확인
    const { count: beforeCount } = await supabase
      .from('youtube_videos')
      .select('*', { count: 'exact', head: true })
      .like('thumbnail_url', '%maxresdefault.jpg%');

    console.log(`📊 수정 대상: ${beforeCount}개`);

    if (beforeCount === 0) {
      return {
        success: true,
        message: '수정할 썸네일이 없습니다. 모든 썸네일이 이미 hqdefault.jpg를 사용 중입니다.',
        count: 0,
      };
    }

    // maxresdefault.jpg 사용하는 모든 영상 가져오기
    const { data: videos, error: fetchError } = await supabase
      .from('youtube_videos')
      .select('id, video_id, thumbnail_url')
      .like('thumbnail_url', '%maxresdefault.jpg%');

    if (fetchError) {
      console.error('❌ 데이터 가져오기 실패:', fetchError);
      throw fetchError;
    }

    let updatedCount = 0;

    // 각 영상의 썸네일 URL 업데이트
    for (const video of videos || []) {
      const newUrl = video.thumbnail_url.replace('maxresdefault.jpg', 'hqdefault.jpg');

      const { error: updateError } = await supabase
        .from('youtube_videos')
        .update({ thumbnail_url: newUrl })
        .eq('id', video.id);

      if (!updateError) {
        updatedCount++;
        if (updatedCount % 50 === 0) {
          console.log(`   진행 중... ${updatedCount}/${videos.length}`);
        }
      } else {
        console.error(`❌ 업데이트 실패 (${video.video_id}):`, updateError);
      }
    }

    console.log(`✅ ${updatedCount}개 썸네일 URL 업데이트 완료`);
    console.log('========================================\n');

    return {
      success: true,
      message: `${updatedCount}개의 썸네일 URL을 hqdefault.jpg로 수정했습니다.`,
      count: updatedCount,
    };
  } catch (error: any) {
    console.error('썸네일 수정 에러:', error);
    return {
      success: false,
      message: error.message || '썸네일 URL 수정에 실패했습니다.',
    };
  }
}
