/**
 * Update Band Countries and Popularity from Spotify
 * Spotify API로 밴드 국가 및 인기도 정보 업데이트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!supabaseUrl || !supabaseServiceKey || !clientId || !clientSecret) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
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

// Spotify에서 아티스트 정보 가져오기
async function getArtistInfo(token, spotifyId) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${spotifyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      followers: data.followers?.total || 0,
      popularity: data.popularity || 0,
      genres: data.genres || []
    };
  } catch (error) {
    console.error(`   ⚠️  Spotify API 에러: ${error.message}`);
    return null;
  }
}

// 국가 추론 (genres에서 country 힌트 찾기)
function inferCountryFromGenres(genres) {
  const countryHints = {
    'k-pop': 'South Korea',
    'korean': 'South Korea',
    'j-rock': 'Japan',
    'j-pop': 'Japan',
    'japanese': 'Japan',
    'uk': 'United Kingdom',
    'british': 'United Kingdom',
    'german': 'Germany',
    'french': 'France',
    'swedish': 'Sweden',
    'finnish': 'Finland',
    'norwegian': 'Norway',
    'danish': 'Denmark',
    'australian': 'Australia',
    'canadian': 'Canada'
  };

  for (const genre of genres) {
    const lowerGenre = genre.toLowerCase();
    for (const [hint, country] of Object.entries(countryHints)) {
      if (lowerGenre.includes(hint)) {
        return country;
      }
    }
  }

  return null;
}

// Supabase에 업데이트
async function updateBandInfo(bandId, info) {
  const { error } = await supabase
    .from('bands')
    .update({
      spotify_followers: info.followers,
      spotify_popularity: info.popularity,
      country: info.country,
      updated_at: new Date().toISOString()
    })
    .eq('id', bandId);

  if (error) {
    console.error(`   ❌ 업데이트 실패:`, error.message);
    return false;
  }

  return true;
}

// 메인 함수
async function updateBandCountries() {
  console.log('🌍 Spotify에서 밴드 국가 및 인기도 정보 업데이트 중...\n');

  try {
    // 1. Spotify 토큰 발급
    console.log('🔑 Spotify API 토큰 발급 중...');
    const token = await getSpotifyToken();
    console.log('✅ 토큰 발급 완료\n');

    // 2. Spotify ID가 있는 밴드들 가져오기
    const { data: bands, error } = await supabase
      .from('bands')
      .select('id, name, spotify_id, country')
      .not('spotify_id', 'is', null)
      .limit(100); // 처음 100개만 (나중에 전체 처리)

    if (error || !bands || bands.length === 0) {
      console.log('⚠️  Spotify ID가 있는 밴드를 찾을 수 없습니다.');
      return;
    }

    console.log(`📀 처리할 밴드: ${bands.length}개\n`);

    let updated = 0;
    let failed = 0;

    // 3. 각 밴드 정보 업데이트
    for (const band of bands) {
      // 이미 country가 있으면 스킵
      if (band.country) {
        console.log(`⏭️  ${band.name} - 이미 국가 정보 있음 (${band.country})`);
        continue;
      }

      console.log(`🎸 처리 중: ${band.name}`);

      const info = await getArtistInfo(token, band.spotify_id);

      if (!info) {
        console.log(`   ❌ Spotify 정보 없음\n`);
        failed++;
        continue;
      }

      // 장르에서 국가 추론
      const country = inferCountryFromGenres(info.genres);

      const updateInfo = {
        followers: info.followers,
        popularity: info.popularity,
        country: country || null
      };

      console.log(`   팔로워: ${updateInfo.followers.toLocaleString()}`);
      console.log(`   인기도: ${updateInfo.popularity}/100`);
      console.log(`   국가: ${updateInfo.country || '추론 불가'}`);

      const success = await updateBandInfo(band.id, updateInfo);

      if (success) {
        updated++;
        console.log(`   ✅ 업데이트 완료\n`);
      } else {
        failed++;
      }

      // Rate limiting 방지 (100ms 대기)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 완료!');
    console.log(`📊 성공: ${updated}개, 실패: ${failed}개`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

updateBandCountries();
