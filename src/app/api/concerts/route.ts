/**
 * Concerts API - Get all concerts
 * GET /api/concerts
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const queryOptions: any = {
      include: {
        band: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    };

    if (limit) {
      queryOptions.take = parseInt(limit, 10);
    }

    const concerts = await prisma.concert.findMany(queryOptions);

    return NextResponse.json({
      concerts,
      total: concerts.length,
    });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concerts' },
      { status: 500 }
    );
  }
}
