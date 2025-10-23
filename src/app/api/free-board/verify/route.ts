/**
 * Free Board Password Verification API Route
 * 자유게시판 비밀번호 확인
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, password } = body;

    if (!post_id || !password) {
      return NextResponse.json(
        { error: '게시글 ID와 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 게시글 조회
    const { data: post, error } = await supabase
      .from('free_board')
      .select('password')
      .eq('id', post_id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, post.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/free-board/verify:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
