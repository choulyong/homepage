/**
 * AshDish Comments API
 * GET: Load all comments for an ashdish post
 * POST: Create a new comment
 * DELETE: Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET - Load all comments for an ashdish post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.ashDishComment.findMany({
      where: { ashdish_id: id },
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
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const comment = await prisma.ashDishComment.create({
      data: {
        ashdish_id: id,
        content: content.trim(),
        author: author || user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
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
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Check if user owns the comment
    const comment = await prisma.ashDishComment.findUnique({
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

    await prisma.ashDishComment.delete({
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
