/**
 * Spotify Band Search API
 * Searches for a band and returns band info + albums
 */

import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getSpotifyToken(): Promise<string> {
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
    throw new Error('Failed to get Spotify token');
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bandName = searchParams.get('name');

    if (!bandName) {
      return NextResponse.json(
        { success: false, error: 'Band name is required' },
        { status: 400 }
      );
    }

    // Get Spotify access token
    const token = await getSpotifyToken();

    // Search for artist
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(bandName)}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed');
    }

    const searchData = await searchResponse.json();
    const artist = searchData.artists?.items?.[0];

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Band not found on Spotify' },
        { status: 404 }
      );
    }

    // Get artist's albums (fetch all pages)
    let allAlbums: any[] = [];
    let nextUrl: string | null = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single,compilation&market=US&limit=50`;

    while (nextUrl) {
      const albumsResponse = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!albumsResponse.ok) {
        throw new Error('Failed to fetch albums');
      }

      const albumsData = await albumsResponse.json();
      allAlbums = [...allAlbums, ...albumsData.items];
      console.log(`📀 Fetched ${albumsData.items.length} albums, total so far: ${allAlbums.length}`);
      nextUrl = albumsData.next; // Get next page URL
    }

    console.log(`✅ Total albums fetched from Spotify: ${allAlbums.length}`);

    // Format band data
    const bandData = {
      name: artist.name,
      spotify_id: artist.id,
      spotify_followers: artist.followers?.total || 0,
      spotify_popularity: artist.popularity || 0,
      genres: artist.genres || [],
      image_url: artist.images?.[0]?.url || null,
      logo_url: artist.images?.[1]?.url || artist.images?.[0]?.url || null,
    };

    // Format albums data (include all types: album, single, compilation)
    const albums = allAlbums
      .map((album: any) => ({
        title: album.name,
        release_year: album.release_date ? parseInt(album.release_date.substring(0, 4)) : null,
        cover_url: album.images?.[0]?.url || null,
        spotify_id: album.id,
        spotify_url: album.external_urls?.spotify || null,
        genres: artist.genres || [],
        album_type: album.album_type, // album, single, compilation
        total_tracks: album.total_tracks,
      }));

    // Remove duplicates (same title and year)
    const uniqueAlbums = albums.filter(
      (album: any, index: number, self: any[]) =>
        index ===
        self.findIndex((a) => a.title === album.title && a.release_year === album.release_year)
    );

    console.log(`🎵 After formatting: ${albums.length} albums`);
    console.log(`🎯 After deduplication: ${uniqueAlbums.length} unique albums`);

    return NextResponse.json({
      success: true,
      band: bandData,
      albums: uniqueAlbums,
      total_albums: uniqueAlbums.length,
    });
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search Spotify' },
      { status: 500 }
    );
  }
}
