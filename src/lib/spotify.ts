/**
 * Spotify Web API 유틸리티
 * 아티스트 검색, 앨범, 트랙 정보 가져오기
 */

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Spotify Access Token 가져오기 (Client Credentials Flow)
 */
async function getAccessToken(): Promise<string> {
  // 토큰이 유효하면 재사용
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // 1분 여유

  return accessToken;
}

/**
 * 아티스트 검색
 */
export async function searchArtist(query: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search artist');
  }

  const data = await response.json();
  return data.artists.items;
}

/**
 * 아티스트 상세 정보 가져오기
 */
export async function getArtistDetails(artistId: string) {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get artist details');
  }

  return response.json();
}

/**
 * 아티스트의 앨범 목록 가져오기
 */
export async function getArtistAlbums(artistId: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get artist albums');
  }

  const data = await response.json();
  return data.items;
}

/**
 * 앨범의 트랙 목록 가져오기
 */
export async function getAlbumTracks(albumId: string) {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get album tracks');
  }

  const data = await response.json();
  return data.items;
}

/**
 * 앨범 상세 정보 가져오기
 */
export async function getAlbumDetails(albumId: string) {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get album details');
  }

  return response.json();
}
