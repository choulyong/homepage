/**
 * Rock Community Data Check Script
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log('\n=== Rock Community Database Statistics ===\n');

  // 밴드 수 카운트
  const { count: bandCount } = await supabase
    .from('bands')
    .select('*', { count: 'exact', head: true });

  // 앨범 수 카운트
  const { count: albumCount } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true });

  console.log(`Bands: ${bandCount || 0}`);
  console.log(`Albums: ${albumCount || 0}\n`);

  // 샘플 밴드 조회
  const { data: samples } = await supabase
    .from('bands')
    .select('name, genres')
    .order('created_at', { ascending: false })
    .limit(10);

  if (samples && samples.length > 0) {
    console.log('=== Recently Added Bands ===\n');
    samples.forEach(band => {
      const genreList = Array.isArray(band.genres) ? band.genres.join(', ') : 'N/A';
      console.log(`- ${band.name} (${genreList})`);
    });
  }

  console.log('\n');
}

checkData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
