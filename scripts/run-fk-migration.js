/**
 * Run foreign key migration for posts table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://xhzqhvjkkfpeavdphoit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoenFodmpra2ZwZWF2ZHBob2l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ3Mzk2OSwiZXhwIjoyMDc1MDQ5OTY5fQ.Hlh-TPsTnK4Sc5T3QVbrjK7TfE26FnZNZs3aY0D4d4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔧 Running foreign key migration...\n');

    const sqlFile = join(__dirname, '..', 'supabase', 'migrations', '20251015_add_posts_user_fk.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL 내용:');
    console.log(sql);
    console.log('\n⏳ 실행 중...\n');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration 실패:', error);
      console.log('\n💡 Supabase Dashboard에서 직접 실행하세요:');
      console.log('   https://supabase.com/dashboard/project/xhzqhvjkkfpeavdphoit/sql');
      console.log('\n다음 SQL을 복사해서 실행:');
      console.log('─'.repeat(60));
      console.log(sql);
      console.log('─'.repeat(60));
    } else {
      console.log('✅ Migration 성공!');
      console.log('   - posts.user_id -> users.id 외래 키 추가됨');
      console.log('   - 인덱스 생성됨');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);

    // 수동 실행 가이드
    const sqlFile = join(__dirname, '..', 'supabase', 'migrations', '20251015_add_posts_user_fk.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    console.log('\n💡 다음 SQL을 Supabase Dashboard에서 직접 실행하세요:');
    console.log('   https://supabase.com/dashboard/project/xhzqhvjkkfpeavdphoit/sql');
    console.log('\n─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
  }
}

runMigration();
