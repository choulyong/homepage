/**
 * Image Upload Component - Tailwind CSS
 * 자체 서버를 사용한 이미지 업로드
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      // 자체 서버 API로 업로드
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업로드에 실패했습니다.');
      }

      const data = await response.json();

      setProgress(100);
      onUploadComplete(data.url);
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
    <div className="flex flex-col gap-4">
      {preview ? (
        <div className="relative w-52 h-52 rounded-md overflow-hidden mx-auto border-2 border-white/20">
          <Image src={preview} alt="Preview" fill style={{ objectFit: 'cover' }} />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-lg transition-all duration-200 hover:bg-red-600 hover:scale-110"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-teal-400 bg-white/15 dark:bg-white/10'
              : 'border-gray-600 dark:border-gray-700 bg-gray-800 dark:bg-gray-900',
            'hover:border-teal-500 hover:bg-white/10'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <p className="text-gray-400 text-sm mb-2">
            {isDragging ? '여기에 드롭하세요' : '클릭하거나 이미지를 드래그 앤 드롭하세요'}
          </p>
          <p className="text-gray-500 text-xs">
            최대 {maxSizeMB}MB, JPG/PNG/GIF/WEBP
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="w-full h-1 bg-gray-700 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
