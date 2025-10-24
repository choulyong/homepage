/**
 * Create Admin User in Supabase
 * 관리자 계정 생성 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  console.error('   .env.local 파일을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = 'choulyong@gmail.com';
  const adminPassword = 'gksrnr82^^';

  console.log('🔧 관리자 계정 생성 중...');
  console.log(`📧 이메일: ${adminEmail}`);

  try {
    // 1. 기존 사용자 확인
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError.message);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === adminEmail);

    if (existingUser) {
      console.log('✅ 관리자 계정이 이미 존재합니다.');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Created At: ${existingUser.created_at}`);

      // 환경변수에 USER_ID 추가 안내
      console.log('\n📝 .env.local 파일에 다음 내용을 추가하세요:');
      console.log(`NEXT_PUBLIC_ADMIN_USER_ID=${existingUser.id}`);

      return existingUser;
    }

    // 2. 새 관리자 계정 생성
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // 이메일 확인 자동 처리
      user_metadata: {
        username: 'Admin',
        role: 'admin'
      }
    });

    if (createError) {
      console.error('❌ 관리자 계정 생성 실패:', createError.message);
      throw createError;
    }

    console.log('✅ 관리자 계정이 생성되었습니다!');
    console.log(`   User ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);

    // 3. users 테이블에 데이터 추가
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: adminEmail,
        username: 'Admin',
        role: 'admin'
      });

    if (insertError) {
      console.warn('⚠️  users 테이블 삽입 실패 (테이블이 없을 수 있음):', insertError.message);
    } else {
      console.log('✅ users 테이블에 관리자 정보 추가 완료');
    }

    // 환경변수에 USER_ID 추가 안내
    console.log('\n📝 .env.local 파일에 다음 내용을 추가하세요:');
    console.log(`NEXT_PUBLIC_ADMIN_USER_ID=${newUser.user.id}`);

    return newUser.user;

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
createAdminUser()
  .then(() => {
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
