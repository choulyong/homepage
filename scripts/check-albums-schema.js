/**
 * Check Albums Table Schema
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 albums 테이블 스키마 확인 중...\n');

  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ 오류:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ 기존 데이터 발견. 컬럼 구조:');
    console.log(Object.keys(data[0]));
    console.log('\n📊 샘플 데이터:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️  테이블이 비어있습니다. 테스트 밴드를 먼저 생성...\n');

    // 1. 테스트 밴드 생성
    const { data: testBand, error: bandError } = await supabase
      .from('bands')
      .insert({ name: 'Schema Test Band' })
      .select()
      .single();

    if (bandError) {
      console.error('❌ 테스트 밴드 생성 실패:', bandError.message);
      return;
    }

    console.log('✅ 테스트 밴드 생성 완료 (ID:', testBand.id, ')\n');

    // 2. 테스트 앨범 삽입
    const { data: insertData, error: insertError } = await supabase
      .from('albums')
      .insert({ band_id: testBand.id, title: 'Test Album' })
      .select();

    if (insertError) {
      console.error('❌ 앨범 삽입 실패:', insertError.message);
      console.log('\n💡 필수 컬럼을 확인하세요.');
    } else {
      console.log('✅ 테스트 앨범 삽입 성공. 컬럼 구조:');
      console.log(Object.keys(insertData[0]));
      console.log('\n📊 삽입된 데이터:');
      console.log(JSON.stringify(insertData[0], null, 2));
    }

    // 3. 테스트 데이터 정리
    await supabase.from('albums').delete().eq('band_id', testBand.id);
    await supabase.from('bands').delete().eq('id', testBand.id);
    console.log('\n🗑️  테스트 데이터 삭제 완료');
  }
}

checkSchema().then(() => process.exit(0));
