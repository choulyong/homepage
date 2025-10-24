/**
 * Spotify Rock Bands Crawler
 * Spotify API를 사용하여 Rock/Metal 밴드 데이터 수집
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

// Spotify API 인증
async function getSpotifyToken(clientId, clientSecret) {
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

// Spotify에서 아티스트 검색
async function searchArtists(token, query, limit = 50) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  return data.artists.items;
}

// 아티스트 상세 정보 및 앨범 가져오기
async function getArtistDetails(token, artistId) {
  // 아티스트 정보
  const artistResponse = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const artist = await artistResponse.json();

  // 아티스트 앨범
  const albumsResponse = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const albumsData = await albumsResponse.json();

  return {
    artist,
    albums: albumsData.items || []
  };
}

// Supabase에 밴드 저장
async function saveBandToSupabase(artistData) {
  const band = {
    name: artistData.name,
    bio: `${artistData.name} is a ${artistData.genres.join(', ')} artist with ${artistData.followers?.total || 0} followers on Spotify. Popularity: ${artistData.popularity}/100`,
    logo_url: artistData.images?.[0]?.url || null,
    genres: artistData.genres,
    country: null, // Spotify API는 국가 정보를 제공하지 않음
    formed_year: null, // Spotify API는 형성 년도를 제공하지 않음
    social_links: {
      spotify: artistData.external_urls?.spotify || null,
      spotify_id: artistData.id,
      popularity: artistData.popularity,
      followers: artistData.followers?.total || 0
    }
  };

  // 중복 체크 (이름으로)
  const { data: existing } = await supabase
    .from('bands')
    .select('id')
    .eq('name', artistData.name)
    .single();

  if (existing) {
    // 기존 데이터 업데이트
    const { data, error } = await supabase
      .from('bands')
      .update(band)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error(`❌ 밴드 업데이트 실패 (${artistData.name}):`, error.message);
      return null;
    }
    return data;
  }

  // 새 데이터 삽입
  const { data, error } = await supabase
    .from('bands')
    .insert(band)
    .select()
    .single();

  if (error) {
    console.error(`❌ 밴드 저장 실패 (${artistData.name}):`, error.message);
    return null;
  }

  return data;
}

// Supabase에 앨범 저장
async function saveAlbumsToSupabase(bandId, albums, artistGenres) {
  let savedCount = 0;

  for (const album of albums) {
    // release_year 추출 (release_date에서 연도만)
    let releaseYear = null;
    if (album.release_date) {
      const year = parseInt(album.release_date.split('-')[0]);
      if (!isNaN(year)) releaseYear = year;
    }

    const albumRecord = {
      band_id: bandId,
      title: album.name,
      cover_url: album.images?.[0]?.url || null,
      release_year: releaseYear,
      label: null, // Spotify API는 레이블 정보를 제공하지 않음
      genres: artistGenres, // 아티스트의 장르 사용
      spotify_id: album.id,
      spotify_url: album.external_urls?.spotify || null
    };

    // 중복 체크 (같은 밴드의 같은 제목)
    const { data: existing } = await supabase
      .from('albums')
      .select('id')
      .eq('band_id', bandId)
      .eq('title', album.name)
      .single();

    if (existing) {
      // 기존 앨범 업데이트
      const { error } = await supabase
        .from('albums')
        .update(albumRecord)
        .eq('id', existing.id);

      if (!error) savedCount++;
    } else {
      // 새 앨범 삽입
      const { error } = await supabase
        .from('albums')
        .insert(albumRecord);

      if (!error) savedCount++;
    }
  }

  return savedCount;
}

// 메인 크롤링 함수
async function crawlSpotifyBands(clientId, clientSecret, searchQueries) {
  console.log('🎸 Spotify Rock Bands Crawler 시작...\n');

  try {
    // 1. Spotify 토큰 발급
    console.log('🔑 Spotify API 토큰 발급 중...');
    const token = await getSpotifyToken(clientId, clientSecret);
    console.log('✅ 토큰 발급 완료\n');

    let totalBands = 0;
    let totalAlbums = 0;

    // 2. 각 검색 쿼리로 아티스트 검색
    for (const query of searchQueries) {
      console.log(`🔍 검색 중: "${query}"`);

      const artists = await searchArtists(token, query, 50);
      console.log(`   찾은 아티스트: ${artists.length}개\n`);

      // 3. 각 아티스트 상세 정보 및 앨범 수집
      for (const artist of artists) {
        // Rock/Metal 장르만 필터링
        const isRockOrMetal = artist.genres.some(genre =>
          genre.includes('rock') ||
          genre.includes('metal') ||
          genre.includes('punk') ||
          genre.includes('grunge') ||
          genre.includes('alternative')
        );

        if (!isRockOrMetal) {
          continue;
        }

        console.log(`   📝 처리 중: ${artist.name} (${artist.genres.join(', ')})`);

        try {
          // 아티스트 상세 정보 및 앨범 가져오기
          const { artist: detailedArtist, albums } = await getArtistDetails(token, artist.id);

          // Supabase에 밴드 저장
          const savedBand = await saveBandToSupabase(detailedArtist);

          if (savedBand) {
            totalBands++;
            console.log(`      ✅ 밴드 저장: ${savedBand.name}`);

            // 앨범 저장
            if (albums.length > 0) {
              const savedAlbumsCount = await saveAlbumsToSupabase(savedBand.id, albums, detailedArtist.genres);
              totalAlbums += savedAlbumsCount;
              console.log(`      ✅ 앨범 ${savedAlbumsCount}개 저장`);
            }
          }

          // Rate limit 방지 (Spotify API: 초당 10 요청)
          await new Promise(resolve => setTimeout(resolve, 150));

        } catch (error) {
          console.error(`      ❌ 오류 (${artist.name}):`, error.message);
        }
      }

      console.log('');
    }

    console.log('🎉 크롤링 완료!');
    console.log(`📊 총 ${totalBands}개 밴드, ${totalAlbums}개 앨범 저장됨\n`);

  } catch (error) {
    console.error('❌ 크롤링 실패:', error);
    throw error;
  }
}

// 실행
if (require.main === module) {
  // Spotify API 자격증명 (환경변수에서 읽거나 직접 입력)
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Spotify API 자격증명이 없습니다.');
    console.error('   .env.local 파일에 다음을 추가하세요:');
    console.error('   SPOTIFY_CLIENT_ID=your_client_id');
    console.error('   SPOTIFY_CLIENT_SECRET=your_client_secret');
    console.error('\n📝 Spotify API 키 발급 방법:');
    console.error('   1. https://developer.spotify.com/dashboard 접속');
    console.error('   2. "Create app" 클릭');
    console.error('   3. App 이름, 설명 입력 (예: Rock Community Crawler)');
    console.error('   4. Redirect URI: http://localhost:3009 입력');
    console.error('   5. "Web API" 체크');
    console.error('   6. "Save" 후 Client ID와 Client Secret 복사\n');
    process.exit(1);
  }

  // Rock/Metal 관련 검색 쿼리
  const searchQueries = [
    'genre:rock',
    'genre:metal',
    'genre:heavy metal',
    'genre:hard rock',
    'genre:classic rock',
    'genre:alternative rock',
    'genre:punk rock',
    'genre:progressive rock',
    'genre:thrash metal',
    'genre:death metal',
    'genre:black metal',
    'genre:power metal',
    'genre:doom metal',
    'genre:grunge'
  ];

  crawlSpotifyBands(clientId, clientSecret, searchQueries)
    .then(() => {
      console.log('✨ 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { crawlSpotifyBands };
