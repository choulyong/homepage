/**
 * Check Album Tracks
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAlbumTracks() {
  console.log('🔍 트랙이 있는 앨범 확인 중...\n');

  const { data: albums } = await supabase
    .from('albums')
    .select('id, title, band:bands(name)')
    .not('spotify_id', 'is', null)
    .limit(5);

  for (const album of albums) {
    const { count } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', album.id);

    console.log(`${album.band.name} - ${album.title}: ${count || 0} tracks`);
    console.log(`   URL: http://localhost:3009/albums/${album.id}\n`);
  }
}

checkAlbumTracks()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
