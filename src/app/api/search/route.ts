import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchQuery = query.toLowerCase();

    // 밴드 검색
    const bands = await prisma.band.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { country: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        country: true,
        image_url: true,
        logo_url: true,
      },
      take: 6,
      orderBy: { spotify_followers: 'desc' },
    });

    // 앨범 검색
    const albums = await prisma.album.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { band: { name: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        title: true,
        cover_url: true,
        release_year: true,
        band: {
          select: {
            name: true,
          },
        },
      },
      take: 6,
      orderBy: { release_year: 'desc' },
    });

    // 비디오 검색
    const videos = await prisma.youtubeVideo.findMany({
      where: {
        title: { contains: searchQuery, mode: 'insensitive' },
      },
      select: {
        id: true,
        video_id: true,
        title: true,
        thumbnail_url: true,
      },
      take: 6,
      orderBy: { published_at: 'desc' },
    });

    // 뉴스 검색
    const news = await prisma.news.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        created_at: true,
      },
      take: 6,
      orderBy: { published_at: 'desc' },
    });

    const results = {
      bands: bands || [],
      albums: albums.map(album => ({
        ...album,
        band_name: album.band?.name || null,
      })) || [],
      videos: videos || [],
      news: news || [],
      posts: [], // TODO: Add posts search when implemented
      gallery: [], // TODO: Add gallery search when implemented
      movies: [], // TODO: Add movies search when implemented
      total: (bands?.length || 0) + (albums?.length || 0) + (videos?.length || 0) + (news?.length || 0),
    };

    return NextResponse.json({ results, query });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
