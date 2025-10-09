import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 좋아요 토글 (추가/제거)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'Target type and ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 이미 좋아요가 있는지 확인
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single();

    if (existing) {
      // 좋아요 제거
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Error removing like:', error);
        return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 });
      }

      return NextResponse.json({ liked: false, message: 'Like removed' });
    } else {
      // 좋아요 추가
      const { error } = await supabase.from('likes').insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
      });

      if (error) {
        console.error('Error adding like:', error);
        return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
      }

      return NextResponse.json({ liked: true, message: 'Like added' });
    }
  } catch (error: any) {
    console.error('Like toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// 좋아요 상태 및 카운트 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: 'Target type and ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 좋아요 카운트 조회
    const { data: countData } = await supabase
      .from('like_counts')
      .select('count')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single();

    const likeCount = countData?.count || 0;

    // 현재 사용자의 좋아요 여부 확인
    const { data: { user } } = await supabase.auth.getUser();
    let isLiked = false;

    if (user) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .single();

      isLiked = !!likeData;
    }

    return NextResponse.json({
      count: likeCount,
      isLiked,
    });
  } catch (error: any) {
    console.error('Get like status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
