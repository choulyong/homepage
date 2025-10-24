const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRockGenre() {
  console.log('🔍 "rock" 장르를 가진 앨범 확인 중...\n');

  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, genres, band:bands(name)')
    .contains('genres', JSON.stringify(['rock']))
    .limit(10);

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  if (!albums || albums.length === 0) {
    console.log('⚠️  "rock" 장르를 가진 앨범이 없습니다.');

    // 모든 장르 확인
    const { data: allAlbums } = await supabase
      .from('albums')
      .select('genres')
      .not('genres', 'is', null)
      .limit(100);

    const genreCounts = {};
    allAlbums?.forEach(album => {
      if (album.genres && Array.isArray(album.genres)) {
        album.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    console.log('\n📊 실제 존재하는 장르 (상위 20개):');
    Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([genre, count]) => {
        console.log(`   ${genre}: ${count}개`);
      });

    return;
  }

  console.log(`✅ "rock" 장르 앨범: ${albums.length}개 발견\n`);
  albums.forEach(album => {
    console.log(`- ${album.band?.name} - ${album.title}`);
    console.log(`  장르: ${album.genres.join(', ')}\n`);
  });
}

checkRockGenre();
