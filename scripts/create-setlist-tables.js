/**
 * Create Setlist Tables via Supabase Client
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔄 Setlist 테이블 생성 중...\n');

  // 테스트로 setlist 생성 시도
  const { data: testBand } = await supabase
    .from('bands')
    .select('id')
    .limit(1)
    .single();

  if (!testBand) {
    console.log('⚠️  밴드가 없습니다. 먼저 밴드 데이터를 추가하세요.');
    return;
  }

  console.log('✅ 테스트 밴드 찾음:', testBand.id);
  console.log('\n📝 Supabase Dashboard에서 다음 단계를 수행하세요:');
  console.log('   1. https://supabase.com/dashboard/project/nqtjbzqrzwesrunkgimb/editor 접속');
  console.log('   2. SQL Editor에서 위의 마이그레이션 SQL 실행');
  console.log('\n또는 Table Editor에서 수동으로 테이블 생성:\n');

  console.log('테이블 1: setlists');
  console.log('  - id (uuid, primary key)');
  console.log('  - band_id (uuid, foreign key to bands)');
  console.log('  - concert_id (uuid, nullable, foreign key to concerts)');
  console.log('  - title (text)');
  console.log('  - venue (text, nullable)');
  console.log('  - event_date (date, nullable)');
  console.log('  - description (text, nullable)');
  console.log('  - is_public (boolean, default true)');
  console.log('  - created_at (timestamp)');
  console.log('  - updated_at (timestamp)\n');

  console.log('테이블 2: setlist_songs');
  console.log('  - id (uuid, primary key)');
  console.log('  - setlist_id (uuid, foreign key to setlists)');
  console.log('  - song_title (text)');
  console.log('  - song_order (integer)');
  console.log('  - duration_seconds (integer, nullable)');
  console.log('  - notes (text, nullable)');
  console.log('  - is_encore (boolean, default false)');
  console.log('  - created_at (timestamp)\n');
}

createTables()
  .then(() => {
    console.log('\n✨ 안내 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 실행 실패:', error);
    process.exit(1);
  });
