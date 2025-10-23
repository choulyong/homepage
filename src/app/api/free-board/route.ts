/**
 * Free Board API Route
 * 자유게시판 글 작성 (비밀번호 해싱 처리)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, nickname, password, image_urls, user_id } = body;

    // 필수 필드 검증
    if (!title || !content || !nickname || !password) {
      return NextResponse.json(
        { error: '제목, 내용, 닉네임, 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 4 || password.length > 20) {
      return NextResponse.json(
        { error: '비밀번호는 4~20자 사이여야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 게시글 저장
    const { data, error } = await supabase
      .from('free_board')
      .insert({
        title: title.trim(),
        content: content.trim(),
        nickname: nickname.trim(),
        password: hashedPassword,
        image_urls: image_urls,
        user_id: user_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json(
        { error: '게시글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, post: data });
  } catch (error) {
    console.error('Error in POST /api/free-board:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
