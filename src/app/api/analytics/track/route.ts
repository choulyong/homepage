import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pagePath, referrer } = body;

    if (!pagePath) {
      return NextResponse.json({ error: 'Page path is required' }, { status: 400 });
    }

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    // IP 주소 해싱 (개인정보 보호)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    // 방문자 ID 생성 (쿠키 또는 생성)
    const cookies = request.cookies;
    let visitorId = cookies.get('visitor_id')?.value;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    // User Agent 파싱 (간단한 방법)
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    const browser = userAgent.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] || 'unknown';
    const os = userAgent.match(/(windows|mac|linux|android|ios)/i)?.[0] || 'unknown';

    const supabase = await createClient();

    // 방문자 로그 기록
    const { error } = await supabase.from('visitor_logs').insert({
      visitor_id: visitorId,
      page_path: pagePath,
      referrer: referrer || null,
      user_agent: userAgent,
      ip_address: ipHash,
      device_type: deviceType,
      browser: browser.toLowerCase(),
      os: os.toLowerCase(),
    });

    if (error) {
      console.error('Error logging visitor:', error);
      return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
    }

    // 페이지뷰 카운트 업데이트
    await supabase.rpc('increment_page_view', { page_path_param: pagePath });

    const response = NextResponse.json({ success: true });

    // 방문자 ID 쿠키 설정 (90일)
    response.cookies.set('visitor_id', visitorId, {
      maxAge: 90 * 24 * 60 * 60, // 90 days
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
