/**
 * Check current bands table schema
 * 현재 bands 테이블 스키마 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBandsSchema() {
  console.log('🔍 bands 테이블 스키마 확인 중...\n');

  try {
    // 첫 번째 밴드의 모든 컬럼 확인
    const { data: band, error } = await supabase
      .from('bands')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ 에러:', error);
      return;
    }

    if (!band) {
      console.log('⚠️  밴드 데이터가 없습니다.');
      return;
    }

    console.log('📊 bands 테이블의 컬럼들:\n');
    Object.keys(band).forEach(key => {
      const value = band[key];
      const type = value === null ? 'NULL' : typeof value;
      console.log(`   ${key}: ${type} = ${value}`);
    });

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

checkBandsSchema();
