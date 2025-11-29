/**
 * YouTube Album Search API
 * Search for album videos on YouTube
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bandName = searchParams.get('band');
    const albumTitle = searchParams.get('album');

    if (!bandName || !albumTitle) {
      return NextResponse.json(
        { success: false, error: 'Band name and album title are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // 검색어: "밴드명 앨범명 full album"
    const query = encodeURIComponent(`${bandName} ${albumTitle} full album`);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // 가장 관련성 높은 비디오 반환
      const videos = data.items.map((item: any) => ({
        videoId: item.id.videoId,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url,
      }));

      return NextResponse.json({
        success: true,
        url: videos[0].url, // 첫 번째 결과 URL
        videos, // 모든 결과 (사용자가 선택할 수 있도록)
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No YouTube videos found',
    });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
