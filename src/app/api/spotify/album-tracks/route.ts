/**
 * Spotify Album Tracks API
 * Get tracks for a specific album
 */

import { NextRequest, NextResponse } from 'next/server';

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

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json(
        { success: false, error: 'Album ID is required' },
        { status: 400 }
      );
    }

    const token = await getSpotifyToken();

    // Get album tracks
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch album tracks');
    }

    const data = await response.json();

    // Format track data
    const tracks = data.items.map((track: any, index: number) => ({
      track_number: track.track_number || index + 1,
      title: track.name,
      duration_seconds: Math.floor(track.duration_ms / 1000),
      spotify_id: track.id,
      preview_url: track.preview_url,
    }));

    return NextResponse.json({
      success: true,
      tracks,
      total: tracks.length,
    });
  } catch (error: any) {
    console.error('Spotify album tracks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}
