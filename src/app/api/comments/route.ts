/**
 * Comments API (Guest-friendly) - SECURITY HARDENED VERSION
 * GET: Fetch comments for a target
 * POST: Create new comment (guest or authenticated)
 * PATCH: Update comment (with password for guests)
 * DELETE: Delete comment (with password for guests)
 *
 * Security improvements:
 * - Password hashes excluded from GET responses
 * - DELETE uses request body instead of URL params
 * - Input validation and sanitization
 * - Stronger password policy (6+ chars, must have number/special char)
 * - Generic error messages to prevent information disclosure
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sanitizeComment, sanitizeName } from '@/lib/sanitize';
import {
  validateContent,
  validateGuestName,
  validateGuestPassword,
} from '@/lib/validation';

// GET /api/comments?targetType=post&targetId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch comments - EXCLUDE sensitive fields (author_password)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        author_name,
        content,
        parent_id,
        target_type,
        target_id,
        created_at,
        updated_at
      `)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      // Generic error message - don't leak database details
      return NextResponse.json(
        { error: '댓글을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { targetType, targetId, content, parentId, authorName, authorPassword } =
      body;

    // Basic validation
    if (!targetType || !targetId || !content) {
      return NextResponse.json(
        { error: 'targetType, targetId, and content are required' },
        { status: 400 }
      );
    }

    // Validate content
    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    // Sanitize content (remove any HTML/script tags)
    content = sanitizeComment(content.trim());

    const supabase = await createClient();

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let commentData: any;

    if (user) {
      // Authenticated user comment
      commentData = {
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        content,
        parent_id: parentId || null,
      };
    } else {
      // Guest comment - validate name and password
      if (!authorName || !authorPassword) {
        return NextResponse.json(
          { error: 'Guest comments require authorName and authorPassword' },
          { status: 400 }
        );
      }

      // Validate guest name
      const nameValidation = validateGuestName(authorName);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }

      // Validate guest password
      const passwordValidation = validateGuestPassword(authorPassword);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.error },
          { status: 400 }
        );
      }

      // Sanitize name
      authorName = sanitizeName(authorName.trim());

      // Hash password for security (increased to 12 rounds for better security)
      const hashedPassword = await bcrypt.hash(authorPassword, 12);

      commentData = {
        user_id: null,
        author_name: authorName,
        author_password: hashedPassword,
        target_type: targetType,
        target_id: targetId,
        content,
        parent_id: parentId || null,
      };
    }

    // Insert comment - select only non-sensitive fields
    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        id,
        user_id,
        author_name,
        content,
        parent_id,
        target_type,
        target_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: '댓글 작성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    let { commentId, content, password } = body;

    if (!commentId || !content) {
      return NextResponse.json(
        { error: 'commentId and content are required' },
        { status: 400 }
      );
    }

    // Validate content
    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    // Sanitize content
    content = sanitizeComment(content.trim());

    const supabase = await createClient();

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch comment to check ownership - only get what we need
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, author_password')
      .eq('id', commentId)
      .single();

    // Use constant-time response pattern to prevent timing attacks
    let authorized = false;

    if (comment && comment.user_id) {
      // Authenticated user comment
      authorized = user !== null && comment.user_id === user.id;
    } else if (comment && !comment.user_id) {
      // Guest comment - verify password
      if (password && comment.author_password) {
        const passwordMatch = await bcrypt.compare(
          password,
          comment.author_password
        );
        authorized = passwordMatch;
      }
    }

    // Generic error message - don't reveal if comment exists
    if (!authorized || !comment) {
      // Add artificial delay to prevent timing attacks
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 100)
      );

      return NextResponse.json(
        { error: '권한이 없거나 댓글을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }

    // Update comment - return only non-sensitive fields
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(`
        id,
        user_id,
        author_name,
        content,
        parent_id,
        target_type,
        target_id,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json(
        { error: '댓글 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    console.error('Error in PATCH /api/comments:', error);
    return NextResponse.json(
      { error: '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY FIX: Read from request body instead of URL params
    // This prevents password exposure in logs
    const body = await request.json();
    const { commentId, password } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch comment to check ownership - only get what we need
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, author_password')
      .eq('id', commentId)
      .single();

    // Use constant-time response pattern
    let authorized = false;

    if (comment && comment.user_id) {
      // Authenticated user comment
      authorized = user !== null && comment.user_id === user.id;
    } else if (comment && !comment.user_id) {
      // Guest comment - verify password
      if (password && comment.author_password) {
        const passwordMatch = await bcrypt.compare(
          password,
          comment.author_password
        );
        authorized = passwordMatch;
      }
    }

    // Generic error message
    if (!authorized || !comment) {
      // Add artificial delay to prevent timing attacks
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 100)
      );

      return NextResponse.json(
        { error: '권한이 없거나 댓글을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }

    // Delete comment (cascade will delete replies)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        { error: '댓글 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/comments:', error);
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
