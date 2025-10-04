/**
 * Image Upload Component
 * Supabase Storage를 사용한 이미지 업로드
 */

'use client';

import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from './Button';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const UploadArea = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed
    ${(props) => (props.$isDragging ? tokens.colors.primary[400] : tokens.colors.gray[600])};
  border-radius: ${tokens.borderRadius.lg};
  padding: ${tokens.spacing[8]};
  text-align: center;
  background: ${(props) =>
    props.$isDragging ? tokens.colors.glass.medium : tokens.colors.gray[800]};
  transition: all ${tokens.transitions.base};
  cursor: pointer;

  &:hover {
    border-color: ${tokens.colors.primary[500]};
    background: ${tokens.colors.glass.light};
  }
`;

const UploadText = styled.p`
  color: ${tokens.colors.gray[400]};
  font-size: ${tokens.typography.fontSize.sm};
  margin-bottom: ${tokens.spacing[2]};
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: ${tokens.borderRadius.md};
  overflow: hidden;
  margin: 0 auto;
  border: 2px solid ${tokens.colors.glass.light};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${tokens.spacing[2]};
  right: ${tokens.spacing[2]};
  background: ${tokens.colors.danger};
  color: ${tokens.colors.white};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${tokens.typography.fontSize.lg};
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${tokens.colors.danger};
    transform: scale(1.1);
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: ${tokens.colors.gray[700]};
  border-radius: ${tokens.borderRadius.full};
  overflow: hidden;
  margin-top: ${tokens.spacing[2]};

  &::after {
    content: '';
    display: block;
    width: ${(props) => props.$progress}%;
    height: 100%;
    background: ${tokens.colors.gradients.kinetic};
    transition: width 0.3s ease;
  }
`;

const ErrorMessage = styled.div`
  color: ${tokens.colors.danger};
  font-size: ${tokens.typography.fontSize.sm};
  text-align: center;
`;

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucket?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onUploadComplete,
  currentImageUrl,
  bucket = 'avatars',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
      return;
    }

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const supabase = createClient();

      // 고유한 파일명 생성
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage에 업로드
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Public URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setProgress(100);
      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || '업로드에 실패했습니다.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <UploadContainer>
      {preview ? (
        <PreviewContainer>
          <Image src={preview} alt="Preview" fill style={{ objectFit: 'cover' }} />
          <RemoveButton onClick={handleRemove}>×</RemoveButton>
        </PreviewContainer>
      ) : (
        <UploadArea
          $isDragging={isDragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <UploadText>
            {isDragging
              ? '여기에 드롭하세요'
              : '클릭하거나 이미지를 드래그 앤 드롭하세요'}
          </UploadText>
          <UploadText style={{ fontSize: tokens.typography.fontSize.xs }}>
            최대 {maxSizeMB}MB, JPG/PNG/GIF/WEBP
          </UploadText>
        </UploadArea>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {uploading && <ProgressBar $progress={progress} />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  );
}
