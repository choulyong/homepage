import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const supabase = await createClient();

    // 기간 내 총 방문자 수
    const { data: totalVisits, error: totalError } = await supabase
      .from('visitor_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    // 고유 방문자 수
    const { data: uniqueVisitors, error: uniqueError } = await supabase
      .from('visitor_logs')
      .select('visitor_id')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const uniqueCount = new Set(uniqueVisitors?.map(v => v.visitor_id)).size;

    // 인기 페이지 Top 10
    const { data: popularPages, error: pagesError } = await supabase
      .from('visitor_logs')
      .select('page_path')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const pageCounts: Record<string, number> = {};
    popularPages?.forEach(log => {
      pageCounts[log.page_path] = (pageCounts[log.page_path] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // 디바이스 타입 분포
    const { data: devices, error: devicesError } = await supabase
      .from('visitor_logs')
      .select('device_type')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const deviceCounts: Record<string, number> = {};
    devices?.forEach(log => {
      deviceCounts[log.device_type] = (deviceCounts[log.device_type] || 0) + 1;
    });

    // 브라우저 분포
    const { data: browsers, error: browsersError } = await supabase
      .from('visitor_logs')
      .select('browser')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const browserCounts: Record<string, number> = {};
    browsers?.forEach(log => {
      browserCounts[log.browser] = (browserCounts[log.browser] || 0) + 1;
    });

    // 일별 방문자 추이 (최근 7일)
    const { data: dailyVisits, error: dailyError } = await supabase
      .from('visitor_logs')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    const dailyCounts: Record<string, number> = {};
    dailyVisits?.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dailyTrend = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      visits: count,
    }));

    const stats = {
      totalVisits: totalVisits ?? 0,
      uniqueVisitors: uniqueCount,
      topPages,
      devices: deviceCounts,
      browsers: browserCounts,
      dailyTrend,
      period: days,
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}
