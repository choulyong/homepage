/**
 * File Upload API Route
 * 자체 서버에 다양한 파일 형식 저장
 * 지원 형식: 이미지, 동영상, 문서, 마크다운, JSON 등
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 유효성 검사 - 다양한 파일 형식 지원
    const allowedTypes = [
      // 이미지
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff',
      // 동영상
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-flv', 'video/x-matroska', 'video/webm', 'video/mpeg',
      // 문서
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      // 마크다운/텍스트
      'text/markdown', 'text/plain', 'application/json', 'text/csv', 'application/xml', 'text/xml',
      // 압축파일
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      // 기타
      'application/octet-stream', // 일반 바이너리 파일
    ];

    // 확장자 기반 추가 검증 (MIME 타입이 정확하지 않을 수 있음)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = [
      // 이미지
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff',
      // 동영상
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg', '3gp', 'm4v',
      // 문서
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      // 마크다운/텍스트
      'md', 'txt', 'json', 'csv', 'xml',
      // 압축파일
      'zip', 'rar', '7z',
    ];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt || '')) {
      return NextResponse.json(
        { error: `지원하지 않는 파일 형식입니다. (${file.type || fileExt})` },
        { status: 400 }
      );
    }

    // 파일 크기 제한 제거 (개인 서버 - 실질적 무제한)
    // 필요시 매우 큰 제한값 설정: 동영상 2GB, 기타 1GB
    const isVideo = file.type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'].includes(fileExt || '');
    const maxSize = isVideo ? 2048 * 1024 * 1024 : 1024 * 1024 * 1024; // 2GB or 1GB

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `파일 크기가 너무 큽니다. 최대 ${isVideo ? '2GB' : '1GB'}까지 업로드 가능합니다.` },
        { status: 400 }
      );
    }

    // 파일명 생성 (랜덤 + 타임스탬프)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // fileExt는 이미 Line 48에서 정의되었으므로 재사용
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // 저장 경로 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', bucket);

    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // 파일 저장
    await writeFile(filePath, buffer);

    // 공개 URL 반환
    const publicUrl = `/uploads/${bucket}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}

// 파일 삭제 API
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      );
    }

    // URL에서 파일 경로 추출
    const filePath = path.join(process.cwd(), 'public', fileUrl);

    // 파일이 uploads 폴더 내에 있는지 확인 (보안)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }

    // 파일 삭제 (파일이 없어도 에러 발생 안함)
    const fs = await import('fs/promises');
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      // 파일이 없는 경우 무시
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'File deletion failed' },
      { status: 500 }
      );
  }
}
