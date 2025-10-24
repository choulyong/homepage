/**
 * Add Album Tracks from Spotify
 * Spotify API를 사용하여 앨범의 트랙 정보 수집
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

if (!clientId || !clientSecret) {
  console.error('❌ Spotify API 자격증명이 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Spotify API 인증
async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// Spotify에서 앨범 트랙 가져오기
async function getAlbumTracks(token, spotifyAlbumId) {
  const response = await fetch(
    `https://api.spotify.com/v1/albums/${spotifyAlbumId}/tracks?limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Supabase에 트랙 저장
async function saveTracksToSupabase(albumId, tracks) {
  const trackRecords = tracks.map((track, index) => ({
    album_id: albumId,
    track_number: track.track_number || (index + 1),
    title: track.name,
    duration_seconds: Math.floor(track.duration_ms / 1000),
    spotify_id: track.id,
    preview_url: track.preview_url
  }));

  // 기존 트랙 삭제 (중복 방지)
  await supabase
    .from('tracks')
    .delete()
    .eq('album_id', albumId);

  // 새 트랙 삽입
  const { data, error } = await supabase
    .from('tracks')
    .insert(trackRecords);

  if (error) {
    console.error(`   ❌ 트랙 저장 실패:`, error.message);
    return 0;
  }

  return trackRecords.length;
}

// 메인 함수
async function addAlbumTracks() {
  console.log('🎵 Spotify에서 앨범 트랙 정보 추가 중...\n');

  try {
    // 1. Spotify 토큰 발급
    console.log('🔑 Spotify API 토큰 발급 중...');
    const token = await getSpotifyToken();
    console.log('✅ 토큰 발급 완료\n');

    // 2. Spotify ID가 있고 트랙이 없는 앨범 가져오기
    const { data: albums, error } = await supabase
      .from('albums')
      .select(`
        id,
        title,
        spotify_id,
        band:bands(name),
        tracks(id)
      `)
      .not('spotify_id', 'is', null)
      .limit(500); // 500개 앨범 확인

    // 트랙이 없는 앨범만 필터링
    const albumsWithoutTracks = albums?.filter(album => !album.tracks || album.tracks.length === 0) || [];

    if (albumsWithoutTracks.length === 0) {
      console.log('✅ 모든 앨범에 트랙이 이미 추가되어 있습니다!');
      return;
    }

    // 최대 50개만 처리
    const albumsToProcess = albumsWithoutTracks.slice(0, 50);

    if (error || !albums || albums.length === 0) {
      console.log('⚠️  Spotify ID가 있는 앨범을 찾을 수 없습니다.');
      return;
    }

    console.log(`📀 트랙이 없는 앨범: ${albumsToProcess.length}개 발견\n`);

    let totalTracks = 0;
    let processedAlbums = 0;

    // 3. 각 앨범의 트랙 정보 가져오기
    for (const album of albumsToProcess) {
      try {
        console.log(`📝 처리 중: ${album.band?.name} - ${album.title}`);

        const tracks = await getAlbumTracks(token, album.spotify_id);

        if (tracks.length > 0) {
          const savedCount = await saveTracksToSupabase(album.id, tracks);
          totalTracks += savedCount;
          processedAlbums++;
          console.log(`   ✅ ${savedCount}개 트랙 저장`);
        } else {
          console.log(`   ⚠️  트랙 정보 없음`);
        }

        // Rate limit 방지
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ 오류: ${error.message}`);
      }
    }

    console.log(`\n🎉 완료!`);
    console.log(`📊 ${processedAlbums}개 앨범, ${totalTracks}개 트랙 추가됨\n`);

  } catch (error) {
    console.error('❌ 실행 실패:', error);
    throw error;
  }
}

addAlbumTracks()
  .then(() => {
    console.log('✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 오류:', error);
    process.exit(1);
  });
