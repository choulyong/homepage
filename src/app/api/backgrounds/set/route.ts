/**
 * Set Page Background API Route
 * 페이지 배경 설정 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { setPageBackground } from '@/app/actions/backgrounds';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pagePath, backgroundUrl, opacity, textColor, backgroundColor } = body;

    if (!pagePath || (!backgroundUrl && !backgroundColor)) {
      return NextResponse.json(
        { error: '페이지 경로와 배경(이미지 또는 색상)이 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await setPageBackground(
      pagePath,
      backgroundUrl || '',
      opacity || 0.3,
      textColor || '#000000',
      backgroundColor || null
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '배경 설정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, background: result.background });
  } catch (error) {
    console.error('Error in POST /api/backgrounds/set:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
