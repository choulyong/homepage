/**
 * Gallery New Post Page - 회원동영상 글쓰기
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';

export default function GalleryNewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'upload' | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 이미지 크기 조정 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageScale, setImageScale] = useState(100);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = getCurrentUser();
      console.log('🔐 Gallery New - 사용자 확인:', currentUser);

      if (!currentUser) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        // 현재 페이지를 redirect 파라미터로 전달
        router.replace('/auth/login?redirect=/gallery/new');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err);
      alert('인증 오류가 발생했습니다. 로그인 페이지로 이동합니다.');
      router.replace('/auth/login?redirect=/gallery/new');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 동영상 파일 크기 제한 (500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('동영상 파일은 500MB 이하만 업로드 가능합니다.');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      alert('이미지는 최대 10개까지 업로드 가능합니다.');
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
      setImageScale(100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!videoType && imageFiles.length === 0) {
      alert('동영상 또는 이미지를 하나 이상 추가해주세요.');
      return;
    }

    if (videoType === 'youtube' && !youtubeUrl.trim()) {
      alert('YouTube 링크를 입력해주세요.');
      return;
    }

    if (videoType === 'upload' && !videoFile) {
      alert('동영상 파일을 선택해주세요.');
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      // 1. 동영상 업로드 (직접 업로드인 경우)
      let videoUrl = null;
      if (videoType === 'upload' && videoFile) {
        setUploadProgress(10);
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('bucket', 'gallery-videos');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error('동영상 업로드 실패');
        }
        videoUrl = uploadData.url;
        setUploadProgress(40);
      }

      // 2. 이미지 업로드
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const formData = new FormData();
          formData.append('file', imageFiles[i]);
          formData.append('bucket', 'gallery-images');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            imageUrls.push(uploadData.url);
          }

          setUploadProgress(40 + (50 / imageFiles.length) * (i + 1));
        }
      }

      // 3. 데이터베이스에 저장
      setUploadProgress(90);
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          author: user.username || user.email || 'Anonymous',
          user_id: user.id,
          video_type: videoType,
          youtube_url: videoType === 'youtube' ? youtubeUrl.trim() : null,
          video_url: videoType === 'upload' ? videoUrl : null,
          image_urls: imageUrls,
        }),
      });

      const data = await response.json();

      // 인증 오류 처리
      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/auth/login');
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create post');
      }

      setUploadProgress(100);
      alert('게시글이 작성되었습니다!');
      router.push('/gallery');
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      alert(err.message || '게시글 작성에 실패했습니다.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // 로그인 체크 중이거나 로그인하지 않은 경우 폼을 보여주지 않음
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {loading ? '로딩 중...' : '로그인 확인 중...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gallery" className="text-red-600 hover:text-red-500 mb-4 inline-block">
            ← 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            회원동영상 작성
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            회원들의 음악 창작물을 공유해보세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="제목을 입력하세요"
              required
              disabled={saving}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="내용을 입력하세요"
              rows={6}
              disabled={saving}
            />
          </div>

          {/* 동영상 선택 */}
          <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              동영상 추가 (선택)
            </label>
            <div className="space-y-4">
              {/* YouTube 링크 */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    name="videoType"
                    checked={videoType === 'youtube'}
                    onChange={() => setVideoType('youtube')}
                    disabled={saving}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    YouTube 링크
                  </span>
                </label>
                {videoType === 'youtube' && (
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={saving}
                  />
                )}
              </div>

              {/* 동영상 직접 업로드 */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    name="videoType"
                    checked={videoType === 'upload'}
                    onChange={() => setVideoType('upload')}
                    disabled={saving}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    동영상 파일 업로드 (최대 500MB)
                  </span>
                </label>
                {videoType === 'upload' && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100
                      dark:file:bg-red-900/20 dark:file:text-red-400"
                    disabled={saving}
                  />
                )}
                {videoFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    선택된 파일: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이미지 추가 (최대 10개)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFilesChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-amber-50 file:text-amber-700
                hover:file:bg-amber-100
                dark:file:bg-amber-900/20 dark:file:text-amber-400"
              disabled={saving}
            />
            {/* 이미지 미리보기 */}
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          transform: selectedImageIndex === index ? `scale(${imageScale / 100})` : 'scale(1)'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      disabled={saving}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* 크기 조정 버튼 */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setImageScale(100);
                      }}
                      className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs"
                      disabled={saving}
                    >
                      ⚙️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 크기 조정 슬라이더 */}
            {selectedImageIndex !== null && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이미지 {selectedImageIndex + 1} 크기 조정: {imageScale}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={imageScale}
                  onChange={(e) => setImageScale(Number(e.target.value))}
                  className="w-full"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(null);
                    setImageScale(100);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  완료
                </button>
              </div>
            )}
          </div>

          {/* 업로드 진행률 */}
          {saving && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                업로드 중... {uploadProgress}%
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '작성 중...' : '작성 완료'}
            </button>
            <Link href="/gallery">
              <button
                type="button"
                disabled={saving}
                className="px-6 py-3 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
