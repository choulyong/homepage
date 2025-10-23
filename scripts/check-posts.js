/**
 * Posts 테이블 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhzqhvjkkfpeavdphoit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoenFodmpra2ZwZWF2ZHBob2l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ3Mzk2OSwiZXhwIjoyMDc1MDQ5OTY5fQ.Hlh-TPsTnK4Sc5T3QVbrjK7TfE26FnZNZs3aY0D4d4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  console.log('📝 Posts 테이블 확인 중...\n');

  // AI 스터디 카테고리 게시글 조회
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category', 'ai_study')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 에러 발생:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('📭 AI 스터디 게시글이 없습니다.');
    return;
  }

  console.log(`✅ 총 ${posts.length}개의 AI 스터디 게시글 발견:\n`);

  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   🆔 ID: ${post.id}`);
    console.log(`   👤 사용자 ID: ${post.user_id}`);
    console.log(`   📅 작성일: ${post.created_at}`);
    console.log(`   📌 고정: ${post.is_pinned ? '예' : '아니오'}`);
    console.log(`   🔗 URL: http://localhost:3000/board/ai_study/${post.id}`);
    console.log('');
  });
}

checkPosts();
