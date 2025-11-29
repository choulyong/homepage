/**
 * Video Comments API
 * GET: Load all comments for a video post
 * POST: Create a new comment
 * DELETE: Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Load all comments for a video post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.videoComment.findMany({
      where: { video_id: id },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error('GET comments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, author, user_id } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Verify user is logged in
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const comment = await prisma.videoComment.create({
      data: {
        video_id: id,
        content: content.trim(),
        author: author || user.username || user.email || 'Anonymous',
        user_id: user_id || user.id,
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error('POST comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Verify user is logged in
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Check if user owns the comment
    const comment = await prisma.videoComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '본인의 댓글만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    await prisma.videoComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
