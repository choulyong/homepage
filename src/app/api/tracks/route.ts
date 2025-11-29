/**
 * Tracks API
 * GET /api/tracks - Get all tracks (with optional album_id filter)
 * POST /api/tracks - Create new track
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const album_id = searchParams.get('album_id');

    const where = album_id ? { album_id } : {};

    const tracks = await prisma.track.findMany({
      where,
      include: {
        album: {
          select: {
            id: true,
            title: true,
            band_id: true,
          },
        },
      },
      orderBy: {
        track_number: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      tracks,
    });
  } catch (error: any) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { album_id, track_number, title, duration_seconds, youtube_url, preview_url } = body;

    if (!album_id || !title || track_number === undefined) {
      return NextResponse.json(
        { success: false, error: 'album_id, track_number, and title are required' },
        { status: 400 }
      );
    }

    const track = await prisma.track.create({
      data: {
        album_id,
        track_number,
        title,
        duration_seconds: duration_seconds || null,
        youtube_url: youtube_url || null,
        preview_url: preview_url || null,
      },
      include: {
        album: true,
      },
    });

    return NextResponse.json(track, { status: 201 });
  } catch (error: any) {
    console.error('Error creating track:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create track' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Track ID is required' },
        { status: 400 }
      );
    }

    await prisma.track.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Track deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete track' },
      { status: 500 }
    );
  }
}
