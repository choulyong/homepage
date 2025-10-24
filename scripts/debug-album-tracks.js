/**
 * 특정 앨범의 트랙 데이터를 디버깅하는 스크립트
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAlbumTracks() {
  console.log('🔍 앨범 트랙 데이터 디버깅 시작...\n');

  // 트랙이 있는 앨범 ID
  const albumId = 'f1aa4470-886f-4e45-887e-edcd6224fa4f';

  // 1. 앨범 정보 확인
  console.log('1️⃣ 앨범 정보 조회:');
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('*, band:bands(*)')
    .eq('id', albumId)
    .single();

  if (albumError) {
    console.error('❌ 앨범 조회 에러:', albumError);
    return;
  }

  console.log(`   ✅ 앨범: ${album.title}`);
  console.log(`   ✅ 밴드: ${album.band?.name}`);
  console.log(`   ✅ Spotify ID: ${album.spotify_id}\n`);

  // 2. 트랙 정보 확인
  console.log('2️⃣ 트랙 정보 조회:');
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .eq('album_id', albumId)
    .order('track_number', { ascending: true });

  if (tracksError) {
    console.error('❌ 트랙 조회 에러:', tracksError);
    return;
  }

  console.log(`   ✅ 트랙 개수: ${tracks?.length || 0}`);

  if (tracks && tracks.length > 0) {
    console.log('\n   트랙 목록:');
    tracks.forEach((track, index) => {
      const duration = track.duration_seconds
        ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}`
        : 'N/A';
      console.log(`   ${index + 1}. [${track.track_number}] ${track.title} (${duration})`);
    });
  } else {
    console.log('   ⚠️ 트랙이 없습니다!');
  }

  // 3. 페이지 쿼리와 동일한 방식으로 조회
  console.log('\n3️⃣ 페이지 쿼리 테스트:');
  const { data: pageAlbum } = await supabase
    .from('albums')
    .select('*, band:bands(*)')
    .eq('id', albumId)
    .single();

  const { data: pageTracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('album_id', albumId)
    .order('track_number', { ascending: true });

  console.log(`   ✅ 페이지 방식 앨범: ${pageAlbum?.title}`);
  console.log(`   ✅ 페이지 방식 트랙: ${pageTracks?.length || 0}개`);
  console.log(`   ✅ 조건: tracks && tracks.length > 0 = ${!!(pageTracks && pageTracks.length > 0)}`);

  console.log('\n✅ 디버깅 완료!');
  console.log(`\n🌐 테스트 URL: http://localhost:3009/albums/${albumId}`);
}

debugAlbumTracks();
