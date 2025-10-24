/**
 * Check Tracks Table Schema
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 tracks 테이블 스키마 확인 중...\n');

  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ 오류:', error.message);

    // tracks 테이블이 없을 경우
    if (error.message.includes('does not exist') || error.message.includes('not find')) {
      console.log('\n💡 tracks 테이블이 없습니다. 생성이 필요합니다.\n');
      console.log('필요한 컬럼:');
      console.log('  - id (uuid, primary key)');
      console.log('  - album_id (uuid, foreign key to albums)');
      console.log('  - track_number (integer)');
      console.log('  - title (text)');
      console.log('  - duration_seconds (integer, nullable)');
      console.log('  - spotify_id (text, nullable, unique)');
      console.log('  - preview_url (text, nullable)');
      console.log('  - created_at (timestamp)\n');
    }
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ 기존 데이터 발견. 컬럼 구조:');
    console.log(Object.keys(data[0]));
    console.log('\n📊 샘플 데이터:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️  테이블이 비어있습니다.\n');
    console.log('💡 Spotify API로 트랙 데이터를 추가하세요.');
  }
}

checkSchema()
  .then(() => {
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 오류:', error);
    process.exit(1);
  });
