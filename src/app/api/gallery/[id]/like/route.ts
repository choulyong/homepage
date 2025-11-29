import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// POST - Update like count for gallery post
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { like_count } = body;

    if (like_count === undefined) {
      return NextResponse.json(
        { success: false, error: 'like_count is required' },
        { status: 400 }
      );
    }

    // Update like count
    await prisma.gallery.update({
      where: { id },
      data: { like_count },
    });

    return NextResponse.json({
      success: true,
      like_count,
    });
  } catch (error: any) {
    console.error('Error updating like count:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update like count' },
      { status: 500 }
    );
  }
}
