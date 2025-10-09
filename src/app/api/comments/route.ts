/**
 * Comments API (Guest-friendly)
 * GET: Fetch comments for a target
 * POST: Create new comment (guest or authenticated)
 * PATCH: Update comment (with password for guests)
 * DELETE: Delete comment (with password for guests)
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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

    // Fetch comments (include both guest and user comments)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        users:user_id (
          username,
          avatar_url
        )
      `
      )
      .eq('target_type', targetType)
      .eq('target_id', parseInt(targetId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, content, parentId, authorName, authorPassword } = body;

    if (!targetType || !targetId || !content) {
      return NextResponse.json(
        { error: 'targetType, targetId, and content are required' },
        { status: 400 }
      );
    }

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
        target_id: parseInt(targetId),
        content,
        parent_id: parentId || null,
      };
    } else {
      // Guest comment
      if (!authorName || !authorPassword) {
        return NextResponse.json(
          { error: 'Guest comments require authorName and authorPassword' },
          { status: 400 }
        );
      }

      // Hash password for security
      const hashedPassword = await bcrypt.hash(authorPassword, 10);

      commentData = {
        user_id: null,
        author_name: authorName,
        author_password: hashedPassword,
        target_type: targetType,
        target_id: parseInt(targetId),
        content,
        parent_id: parentId || null,
      };
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(
        `
        *,
        users:user_id (
          username,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, content, password } = body;

    if (!commentId || !content) {
      return NextResponse.json(
        { error: 'commentId and content are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch comment to check ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, author_password')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Authorization check
    if (comment.user_id) {
      // Authenticated user comment
      if (!user || comment.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Guest comment - verify password
      if (!password) {
        return NextResponse.json(
          { error: 'Password required for guest comments' },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, comment.author_password);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
      }
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        *,
        users:user_id (
          username,
          avatar_url
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    console.error('Error in PATCH /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const password = searchParams.get('password');

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

    // Fetch comment to check ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id, author_password')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Authorization check
    if (comment.user_id) {
      // Authenticated user comment
      if (!user || comment.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Guest comment - verify password
      if (!password) {
        return NextResponse.json(
          { error: 'Password required for guest comments' },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, comment.author_password);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
      }
    }

    // Delete comment (cascade will delete replies)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
