/**
 * Schedules 테이블 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhzqhvjkkfpeavdphoit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoenFodmpra2ZwZWF2ZHBob2l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ3Mzk2OSwiZXhwIjoyMDc1MDQ5OTY5fQ.Hlh-TPsTnK4Sc5T3QVbrjK7TfE26FnZNZs3aY0D4d4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchedules() {
  console.log('📅 Schedules 테이블 확인 중...\n');

  // 모든 일정 조회
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('❌ 에러 발생:', error);
    return;
  }

  if (!schedules || schedules.length === 0) {
    console.log('📭 저장된 일정이 없습니다.');
    return;
  }

  console.log(`✅ 총 ${schedules.length}개의 일정 발견:\n`);

  schedules.forEach((schedule, index) => {
    console.log(`${index + 1}. ${schedule.title}`);
    console.log(`   📅 시작: ${schedule.start_time}`);
    console.log(`   📅 종료: ${schedule.end_time}`);
    console.log(`   👤 사용자 ID: ${schedule.user_id}`);
    console.log(`   🎨 색상: ${schedule.color || '기본'}`);
    console.log(`   🔒 공개: ${schedule.is_public ? '예' : '아니오'}`);
    console.log(`   🌞 종일: ${schedule.is_all_day ? '예' : '아니오'}`);
    console.log('');
  });

  // 캠핑 일정 찾기
  const campingSchedule = schedules.find(s => s.title.includes('캠핑'));
  if (campingSchedule) {
    console.log('🏕️ 캠핑 일정 발견!');
    console.log(JSON.stringify(campingSchedule, null, 2));
  } else {
    console.log('⚠️ "캠핑"이 포함된 일정을 찾을 수 없습니다.');
  }
}

checkSchedules();
