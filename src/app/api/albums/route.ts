/**
 * Albums API
 * GET /api/albums - Get all albums (with optional band_id filter)
 * POST /api/albums - Create new album
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const band_id = searchParams.get('band_id');
    const spotify_id = searchParams.get('spotify_id');
    const skip = searchParams.get('skip');
    const take = searchParams.get('take');

    const where: any = {};

    if (band_id) {
      where.band_id = band_id;
    }

    // Spotify ID로 검색 (중복 체크용)
    if (spotify_id) {
      where.spotify_id = spotify_id;
      const albums = await prisma.album.findMany({ where });
      return NextResponse.json({ albums });
    }

    // Pagination 지원
    const queryOptions: any = {
      where,
      include: {
        band: {
          select: {
            id: true,
            name: true,
            country: true,
            image_url: true,
          },
        },
      },
      orderBy: {
        release_year: 'desc',
      },
    };

    if (skip) {
      queryOptions.skip = parseInt(skip, 10);
    }

    if (take) {
      queryOptions.take = parseInt(take, 10);
    }

    const albums = await prisma.album.findMany(queryOptions);

    return NextResponse.json({
      success: true,
      albums,
    });
  } catch (error: any) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { band_id, title, cover_url, release_year, label, genres, spotify_id, spotify_url, youtube_url } = body;

    if (!band_id || !title) {
      return NextResponse.json(
        { success: false, error: 'band_id and title are required' },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        band_id,
        title,
        cover_url: cover_url || null,
        release_year: release_year || null,
        label: label || null,
        genres: genres || [],
        spotify_id: spotify_id || null,
        spotify_url: spotify_url || null,
        youtube_url: youtube_url || null,
      },
      include: {
        band: true,
      },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error: any) {
    console.error('Error creating album:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create album' },
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
        { success: false, error: 'Album ID is required' },
        { status: 400 }
      );
    }

    await prisma.album.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Album deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete album' },
      { status: 500 }
    );
  }
}
