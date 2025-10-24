/**
 * Delete Albums and Tracks
 * 기존 앨범과 트랙 데이터 삭제
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteData() {
  console.log('🗑️  기존 앨범 및 트랙 데이터 삭제 중...\n');

  try {
    // 1. 트랙 삭제 (먼저 foreign key 때문에)
    const { error: tracksError } = await supabase
      .from('tracks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제

    if (tracksError) {
      console.error('❌ 트랙 삭제 실패:', tracksError.message);
    } else {
      console.log('✅ 트랙 데이터 삭제 완료');
    }

    // 2. 앨범 삭제
    const { error: albumsError } = await supabase
      .from('albums')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제

    if (albumsError) {
      console.error('❌ 앨범 삭제 실패:', albumsError.message);
    } else {
      console.log('✅ 앨범 데이터 삭제 완료');
    }

    console.log('\n🎉 데이터 삭제 완료!');
    console.log('💡 이제 크롤러를 실행하세요: node scripts/crawl-spotify-bands.js\n');

  } catch (error) {
    console.error('❌ 실행 실패:', error);
    throw error;
  }
}

deleteData()
  .then(() => {
    console.log('✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 오류:', error);
    process.exit(1);
  });
