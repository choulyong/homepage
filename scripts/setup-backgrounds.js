/**
 * Setup Background Images Script
 * 각 페이지에 맞는 배경 이미지를 Unsplash에서 가져와 설정
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (.env.local 파일에서 읽기)
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 설정이 없습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { path: '/board/ai_study', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80', name: 'AI 스터디', textColor: '#FFFFFF' },
  { path: '/board/bigdata_study', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80', name: '빅데이터 스터디', textColor: '#FFFFFF' },
  { path: '/free-board', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80', name: '자유게시판', textColor: '#FFFFFF' },
  { path: '/running', imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=80', name: '러닝 트래커', textColor: '#FFFFFF' },
  { path: '/gallery', imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80', name: '갤러리', textColor: '#FFFFFF' },
  { path: '/movies', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80', name: '영화 리뷰', textColor: '#FFFFFF' },
  { path: '/news', imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=80', name: '뉴스', textColor: '#FFFFFF' },
  { path: '/artworks', imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1920&q=80', name: 'AI 작품', textColor: '#FFFFFF' },
  { path: '/youtube', imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1920&q=80', name: 'YouTube', textColor: '#FFFFFF' },
  { path: '/schedule', imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80', name: '일정 관리', textColor: '#FFFFFF' }
];

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { followRedirect: true }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          const chunks = [];
          redirectResponse.on('data', (chunk) => chunks.push(chunk));
          redirectResponse.on('end', () => resolve(Buffer.concat(chunks)));
          redirectResponse.on('error', reject);
        });
      } else {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }
    }).on('error', reject);
  });
}

async function uploadImage(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: filename,
      contentType: 'image/jpeg'
    });
    form.append('bucket', 'backgrounds');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

async function setPageBackground(pagePath, backgroundUrl, textColor) {
  const { data, error } = await supabase
    .from('page_backgrounds')
    .upsert(
      {
        page_path: pagePath,
        background_url: backgroundUrl,
        background_color: null,
        opacity: 0.3,
        text_color: textColor,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'page_path',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

async function setupBackgrounds() {
  console.log('🎨 배경 이미지 설정 시작...\n');

  for (const category of categories) {
    try {
      console.log(`📥 ${category.name} 이미지 다운로드 중...`);

      const imageBuffer = await downloadImage(category.imageUrl);
      console.log(`   ✓ 다운로드 완료 (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

      console.log(`📤 서버에 업로드 중...`);
      const filename = `${category.path.replace(/\//g, '-').substring(1)}-bg.jpg`;
      const uploadResult = await uploadImage(imageBuffer, filename);
      console.log(`   ✓ 업로드 완료: ${uploadResult.url}`);

      console.log(`🎯 페이지 배경 설정 중...`);
      await setPageBackground(category.path, uploadResult.url, category.textColor);
      console.log(`   ✓ ${category.name} 배경 설정 완료\n`);

    } catch (error) {
      console.error(`   ✗ ${category.name} 실패:`, error.message, '\n');
    }
  }

  console.log('✅ 모든 배경 이미지 설정 완료!');
}

// 실행
setupBackgrounds().catch(console.error);
