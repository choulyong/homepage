/**
 * Bands API - METALDRAGON Rock Community
 * GET /api/bands - Get all bands
 * POST /api/bands - Create a new band
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const spotifyId = searchParams.get('spotify_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // 기본 100개

    const offset = (page - 1) * limit;

    // Build where clause - 검색어가 있으면 name, country, genres에서 검색
    const where: any = {};

    // Spotify ID로 검색 (중복 체크용)
    if (spotifyId) {
      where.spotify_id = spotifyId;
      const bands = await prisma.band.findMany({ where });
      return NextResponse.json({ bands });
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          country: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (country && !search) {
      where.country = country;
    }

    // Get total count
    const total = await prisma.band.count({ where });

    // Get bands - Spotify 팔로워 순으로 정렬
    const bands = await prisma.band.findMany({
      where,
      orderBy: {
        spotify_followers: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      bands: bands || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 명시적으로 필드 매핑
    const band = await prisma.band.create({
      data: {
        name: body.name,
        bio: body.bio || null,
        logo_url: body.logo_url || null,
        country: body.country || null,
        formed_year: body.formed_year || null,
        genres: body.genres || [],
        social_links: body.social_links || null,
        spotify_id: body.spotify_id || null,
        spotify_followers: body.spotify_followers || 0,
        spotify_popularity: body.spotify_popularity || 0,
        origin: body.origin || null,
        image_url: body.image_url || null,
      },
    });

    return NextResponse.json(band, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
