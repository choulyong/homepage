/**
 * Debug API: Check all schedules in database
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 모든 일정 조회 (디버깅용)
    const { data: allSchedules, error: allError } = await supabase
      .from('schedules')
      .select('*')
      .order('start_time', { ascending: true });

    // 현재 사용자의 일정만 조회
    const { data: mySchedules, error: myError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    return NextResponse.json({
      userId: user.id,
      userEmail: user.email,
      totalSchedules: allSchedules?.length || 0,
      mySchedules: mySchedules?.length || 0,
      allSchedulesData: allSchedules || [],
      mySchedulesData: mySchedules || [],
      errors: {
        all: allError?.message,
        my: myError?.message,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
