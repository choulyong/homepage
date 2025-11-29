import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Load all videos
export async function GET() {
  try {
    const posts = await prisma.video.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: any) {
    console.error('Error loading videos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load posts' },
      { status: 500 }
    );
  }
}

// POST - Create new video post (auth required)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    console.log('🔐 Videos POST: Checking authentication...');
    const user = await requireAuth();
    console.log('✅ Videos POST: User authenticated:', user.email);

    const body = await request.json();
    const { title, content, author, user_id, video_type, youtube_url, video_url, image_urls } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { success: false, error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Create video post
    const post = await prisma.video.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        author,
        user_id: user_id || user.id,
        video_type: video_type || null,
        youtube_url: youtube_url?.trim() || null,
        video_url: video_url || null,
        image_urls: image_urls || [],
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('Error creating video post:', error);

    // Handle auth error
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to create posts' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video post (auth required, owner only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists and belongs to user
    const post = await prisma.video.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete post
    await prisma.video.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting video post:', error);

    // Handle auth error
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to delete posts' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
