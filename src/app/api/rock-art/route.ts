import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Load all rock art
export async function GET() {
  try {
    const artworks = await prisma.rockArt.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      artworks,
    });
  } catch (error: any) {
    console.error('Error loading rock art:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load rock art' },
      { status: 500 }
    );
  }
}

// POST - Create new rock art (auth required)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth();

    const body = await request.json();
    const { title, description, image_url, author, user_id } = body;

    // Validate required fields
    if (!title || !image_url || !author) {
      return NextResponse.json(
        { success: false, error: 'Title, image_url, and author are required' },
        { status: 400 }
      );
    }

    // Create rock art entry
    const artwork = await prisma.rockArt.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        image_url,
        author,
        user_id: user_id || user.id,
      },
    });

    return NextResponse.json({
      success: true,
      artwork,
    });
  } catch (error: any) {
    console.error('Error creating rock art:', error);

    // Handle auth error
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to upload rock art' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create rock art' },
      { status: 500 }
    );
  }
}

// DELETE - Delete rock art (auth required, owner only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Artwork ID is required' },
        { status: 400 }
      );
    }

    // Check if artwork exists and belongs to user
    const artwork = await prisma.rockArt.findUnique({
      where: { id },
    });

    if (!artwork) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      );
    }

    if (artwork.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own artworks' },
        { status: 403 }
      );
    }

    // Delete artwork
    await prisma.rockArt.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting rock art:', error);

    // Handle auth error
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to delete rock art' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete rock art' },
      { status: 500 }
    );
  }
}
