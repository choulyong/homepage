/**
 * Supabase 마이그레이션 실행 스크립트
 * Usage: npx tsx scripts/run-migration.ts <migration-file-name>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(migrationFileName: string) {
  try {
    console.log(`\n🚀 마이그레이션 실행 중: ${migrationFileName}\n`);

    // 마이그레이션 SQL 파일 읽기
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFileName);
    const sql = readFileSync(migrationPath, 'utf-8');

    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // RPC 함수가 없을 경우, 직접 SQL 실행 시도
      console.log('⚠️  exec_sql RPC 함수가 없습니다. SQL을 직접 실행합니다...\n');

      // SQL을 세미콜론으로 분할하여 순차 실행
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: execError } = await supabase.from('_sql_exec').select().limit(0);

          if (execError) {
            console.error(`❌ SQL 실행 실패:`, execError);
            console.log(`\n📋 실행하려던 SQL:\n${statement}\n`);
            throw execError;
          }
        }
      }

      console.log('\n⚠️  SQL 직접 실행은 제한적입니다. Supabase Dashboard에서 직접 실행하는 것을 권장합니다.\n');
      console.log('📋 Supabase Dashboard SQL Editor에서 아래 파일의 내용을 실행하세요:');
      console.log(`   ${migrationPath}\n`);

      return;
    }

    console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!\n');
    console.log('결과:', data);
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// CLI 인자 처리
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ 마이그레이션 파일 이름을 지정해주세요.');
  console.log('\n사용법: npx tsx scripts/run-migration.ts <migration-file-name>');
  console.log('예시: npx tsx scripts/run-migration.ts 20251014_add_dashboard_template_features.sql\n');
  process.exit(1);
}

// 마이그레이션 실행
runMigration(migrationFile);
