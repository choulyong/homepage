/**
 * Video Like API
 * POST: Update like count for a video
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { like_count } = await request.json();

    const updatedPost = await prisma.video.update({
      where: { id },
      data: { like_count },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error('Like video error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
