/**
 * Board Posts API - Get all community board posts
 * GET /api/board-posts
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const queryOptions: any = {
      orderBy: {
        created_at: 'desc',
      },
      take: limit ? parseInt(limit, 10) : 100, // Default 100, allow override
    };

    // Get posts from board_posts table
    const posts = await prisma.boardPost.findMany(queryOptions);

    return NextResponse.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('Error fetching board posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board posts' },
      { status: 500 }
    );
  }
}
