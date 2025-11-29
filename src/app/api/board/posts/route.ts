import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, author, user_id, image_urls, is_pinned } = body;

    if (!title || !content || !category || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const post = await prisma.boardPost.create({
      data: {
        title,
        content,
        category,
        author: author || '익명',
        user_id,
        image_urls: image_urls || [],
        is_pinned: is_pinned || false,
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
