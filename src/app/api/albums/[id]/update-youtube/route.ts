import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { youtube_url } = await request.json();
    const albumId = params.id;

    if (!youtube_url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Update album YouTube URL
    const updatedAlbum = await prisma.album.update({
      where: { id: albumId },
      data: { youtube_url },
      include: {
        band: true,
      },
    });

    return NextResponse.json({
      success: true,
      album: updatedAlbum,
    });
  } catch (error) {
    console.error('Error updating album YouTube URL:', error);
    return NextResponse.json(
      { error: 'Failed to update YouTube URL' },
      { status: 500 }
    );
  }
}
