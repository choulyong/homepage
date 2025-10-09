/**
 * Dynamic Image Serving API
 * public/uploads 폴더의 이미지를 동적으로 서빙
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 경로 생성
    const imagePath = params.path.join('/');
    const filePath = path.join(process.cwd(), 'public', 'uploads', imagePath);

    // 파일 존재 확인
    if (!existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // 보안: uploads 폴더 외부 접근 차단
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 파일 읽기
    const fileBuffer = await readFile(filePath);

    // MIME 타입 결정
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 이미지 반환
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
