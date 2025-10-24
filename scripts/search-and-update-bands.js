/**
 * Search and Update Band Information from Spotify
 * 밴드 이름으로 Spotify 검색 후 정보 업데이트
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

// Spotify에서 아티스트 검색
async function searchArtist(token, artistName) {
  try {
    const encodedName = encodeURIComponent(artistName);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedName}&type=artist&limit=1`,
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

    if (!data.artists || !data.artists.items || data.artists.items.length === 0) {
      return null;
    }

    const artist = data.artists.items[0];

    return {
      spotifyId: artist.id,
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      genres: artist.genres || [],
      images: artist.images || []
    };
  } catch (error) {
    console.error(`   ⚠️  Spotify 검색 에러: ${error.message}`);
    return null;
  }
}

// 국가 추론 (genres에서 country 힌트 찾기)
function inferCountryFromGenres(genres) {
  const countryHints = {
    'k-pop': 'South Korea',
    'k-rock': 'South Korea',
    'korean': 'South Korea',
    'j-rock': 'Japan',
    'j-pop': 'Japan',
    'j-metal': 'Japan',
    'japanese': 'Japan',
    'uk': 'United Kingdom',
    'british': 'United Kingdom',
    'german': 'Germany',
    'deutsch': 'Germany',
    'french': 'France',
    'swedish': 'Sweden',
    'finnish': 'Finland',
    'norwegian': 'Norway',
    'danish': 'Denmark',
    'australian': 'Australia',
    'canadian': 'Canada',
    'american': 'United States',
    'us': 'United States'
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
  const updateData = {
    spotify_id: info.spotifyId,
    spotify_followers: info.followers,
    spotify_popularity: info.popularity,
    updated_at: new Date().toISOString()
  };

  if (info.country) {
    updateData.country = info.country;
  }

  if (info.imageUrl) {
    updateData.image_url = info.imageUrl;
  }

  const { error } = await supabase
    .from('bands')
    .update(updateData)
    .eq('id', bandId);

  if (error) {
    console.error(`   ❌ 업데이트 실패:`, error.message);
    return false;
  }

  return true;
}

// 메인 함수
async function searchAndUpdateBands() {
  console.log('🔍 Spotify에서 밴드 정보 검색 및 업데이트 중...\n');

  try {
    // 1. Spotify 토큰 발급
    console.log('🔑 Spotify API 토큰 발급 중...');
    const token = await getSpotifyToken();
    console.log('✅ 토큰 발급 완료\n');

    // 2. 아직 Spotify ID가 없는 밴드들 가져오기 (또는 country가 없는 밴드)
    const { data: bands, error } = await supabase
      .from('bands')
      .select('*')
      .is('country', null) // 국가 정보가 없는 밴드만
      .limit(50); // 한 번에 50개씩

    if (error) {
      console.error('❌ 밴드 조회 에러:', error);
      return;
    }

    if (!bands || bands.length === 0) {
      console.log('✅ 모든 밴드에 국가 정보가 있습니다!');
      return;
    }

    console.log(`📀 처리할 밴드: ${bands.length}개\n`);

    let updated = 0;
    let failed = 0;
    let notFound = 0;

    // 3. 각 밴드 검색 및 업데이트
    for (const band of bands) {
      console.log(`🎸 검색 중: ${band.name}`);

      const info = await searchArtist(token, band.name);

      if (!info) {
        console.log(`   ❌ Spotify에서 찾을 수 없음\n`);
        notFound++;
        continue;
      }

      // 장르에서 국가 추론
      const country = inferCountryFromGenres(info.genres);

      // 이미지 URL (가장 큰 이미지)
      const imageUrl = info.images.length > 0 ? info.images[0].url : null;

      const updateInfo = {
        spotifyId: info.spotifyId,
        followers: info.followers,
        popularity: info.popularity,
        country: country || null,
        imageUrl: imageUrl
      };

      console.log(`   Spotify ID: ${updateInfo.spotifyId}`);
      console.log(`   팔로워: ${updateInfo.followers.toLocaleString()}`);
      console.log(`   인기도: ${updateInfo.popularity}/100`);
      console.log(`   국가: ${updateInfo.country || '추론 불가'}`);
      console.log(`   장르: ${info.genres.slice(0, 3).join(', ')}`);

      const success = await updateBandInfo(band.id, updateInfo);

      if (success) {
        updated++;
        console.log(`   ✅ 업데이트 완료\n`);
      } else {
        failed++;
      }

      // Rate limiting 방지 (200ms 대기)
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n🎉 완료!');
    console.log(`📊 성공: ${updated}개, 실패: ${failed}개, 검색 실패: ${notFound}개`);

    if (bands.length === 50) {
      console.log('\n💡 더 많은 밴드를 처리하려면 스크립트를 다시 실행하세요.');
    }

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

searchAndUpdateBands();
