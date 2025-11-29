/**
 * YouTube Data API utilities
 * Search for album videos/playlists on YouTube
 */

/**
 * YouTube 검색 - 앨범명으로 비디오/플레이리스트 검색
 */
export async function searchYouTubeAlbum(bandName: string, albumTitle: string): Promise<string | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn('YouTube API key not configured');
      return null;
    }

    // 검색어: "밴드명 앨범명 full album"
    const query = encodeURIComponent(`${bandName} ${albumTitle} full album`);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return null;
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

/**
 * 여러 앨범의 YouTube URL을 배치로 검색
 */
export async function searchYouTubeAlbumsBatch(
  bandName: string,
  albums: Array<{ title: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const album of albums) {
    try {
      const url = await searchYouTubeAlbum(bandName, album.title);
      if (url) {
        results.set(album.title, url);
      }
      // Rate limiting: YouTube API has quota limits
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between requests
    } catch (error) {
      console.error(`Failed to search YouTube for ${album.title}:`, error);
    }
  }

  return results;
}
