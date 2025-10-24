/**
 * Run Setlist Migration
 * Supabase에 setlists와 setlist_songs 테이블 생성
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Setlist 마이그레이션 실행 중...\n');

  try {
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, '../supabase/migrations/20250124_create_setlists.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // SQL 실행 (Supabase는 직접 SQL 실행을 지원하지 않으므로, 수동으로 Supabase Dashboard에서 실행 필요)
    console.log('📋 다음 SQL을 Supabase Dashboard의 SQL Editor에서 실행하세요:\n');
    console.log('=' .repeat(80));
    console.log(sql);
    console.log('=' .repeat(80));
    console.log('\n💡 Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql');
    console.log('\n또는 아래 명령어로 테이블을 생성하세요:\n');

    // 테이블 생성 확인
    console.log('✅ 마이그레이션 SQL 준비 완료');
    console.log('📝 위의 SQL을 Supabase Dashboard에서 실행 후 계속하세요.\n');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 실행 실패:', error);
    process.exit(1);
  });
