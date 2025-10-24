/**
 * Create Sample Setlists
 * 테스트용 샘플 세트리스트 데이터 생성
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleSetlists() {
  console.log('🎸 샘플 Setlist 생성 중...\n');

  try {
    // 1. 밴드 가져오기
    const { data: bands, error: bandsError } = await supabase
      .from('bands')
      .select('id, name')
      .limit(5);

    if (bandsError || !bands || bands.length === 0) {
      console.error('❌ 밴드를 찾을 수 없습니다:', bandsError);
      console.log('💡 먼저 밴드 데이터를 추가하세요 (Spotify crawler 실행)');
      return;
    }

    console.log(`✅ ${bands.length}개의 밴드 발견\n`);

    // 2. 각 밴드에 대한 샘플 세트리스트 생성
    let totalCreated = 0;

    for (const band of bands) {
      console.log(`📝 ${band.name}의 세트리스트 생성 중...`);

      // 세트리스트 생성
      const { data: setlist, error: setlistError } = await supabase
        .from('setlists')
        .insert({
          band_id: band.id,
          title: `${band.name} Live at Rock Festival 2025`,
          venue: 'Seoul Olympic Stadium',
          event_date: '2025-06-15',
          description: `An unforgettable night with ${band.name}`,
          is_public: true,
        })
        .select()
        .single();

      if (setlistError) {
        console.error(`   ❌ 세트리스트 생성 실패:`, setlistError.message);
        continue;
      }

      console.log(`   ✅ 세트리스트 생성: ${setlist.title}`);

      // 샘플 곡 추가
      const sampleSongs = [
        { title: 'Opening Song', order: 1, duration: 240, encore: false },
        { title: 'Hit Single', order: 2, duration: 210, encore: false },
        { title: 'Classic Track', order: 3, duration: 300, encore: false },
        { title: 'Fan Favorite', order: 4, duration: 180, encore: false },
        { title: 'Deep Cut', order: 5, duration: 270, encore: false },
        { title: 'Power Ballad', order: 6, duration: 330, encore: false },
        { title: 'Crowd Pleaser', order: 7, duration: 195, encore: false },
        { title: 'Encore - Greatest Hit', order: 8, duration: 250, encore: true },
        { title: 'Encore - Thank You', order: 9, duration: 280, encore: true },
      ];

      const songsToInsert = sampleSongs.map((song) => ({
        setlist_id: setlist.id,
        song_title: song.title,
        song_order: song.order,
        duration_seconds: song.duration,
        is_encore: song.encore,
        notes: song.encore ? 'Encore performance' : null,
      }));

      const { error: songsError } = await supabase
        .from('setlist_songs')
        .insert(songsToInsert);

      if (songsError) {
        console.error(`   ❌ 곡 추가 실패:`, songsError.message);
      } else {
        console.log(`   ✅ ${sampleSongs.length}개의 곡 추가`);
        totalCreated++;
      }

      console.log('');
    }

    console.log(`🎉 완료! ${totalCreated}개의 세트리스트 생성됨`);
    console.log(`\n🌐 확인: http://localhost:3009/setlists\n`);

  } catch (error) {
    console.error('❌ 실행 실패:', error);
    throw error;
  }
}

createSampleSetlists()
  .then(() => {
    console.log('✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 오류:', error);
    process.exit(1);
  });
