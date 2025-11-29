import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Load single gallery post
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const post = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.gallery.update({
      where: { id },
      data: { view_count: post.view_count + 1 },
    });

    return NextResponse.json({
      success: true,
      post: { ...post, view_count: post.view_count + 1 },
    });
  } catch (error: any) {
    console.error('Error loading gallery post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load post' },
      { status: 500 }
    );
  }
}
