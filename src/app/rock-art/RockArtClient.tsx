'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth-client';
import Image from 'next/image';

interface RockArt {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  author: string;
  user_id: string | null;
  created_at: string;
}

export function RockArtClient() {
  const [artworks, setArtworks] = useState<RockArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    loadArtworks();

    // 로그인 이벤트 리스너 추가
    const handleLoginEvent = () => {
      console.log('🔔 Login event received in Rock Art - reloading user');
      loadUser();
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  const loadUser = () => {
    const currentUser = getCurrentUser();
    console.log('🔐 Rock Art - localStorage user:', currentUser);
    setUser(currentUser);
  };

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rock-art');
      const data = await response.json();

      if (data.success) {
        setArtworks(data.artworks);
      }
    } catch (err) {
      console.error('Error loading artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload image to server
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bucket', 'rock-art');

      setUploadProgress(30);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      setUploadProgress(60);

      // Create rock art entry
      const response = await fetch('/api/rock-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          image_url: uploadData.url,
          author: user.username || user.email?.split('@')[0] || 'Anonymous',
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create artwork');
      }

      setUploadProgress(100);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadForm(false);

      // Reload artworks
      await loadArtworks();

      alert('AI Rock Art가 성공적으로 업로드되었습니다!');

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/rock-art?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete artwork');
      }

      // Delete image file
      await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      // Reload artworks
      await loadArtworks();

      alert('삭제되었습니다.');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎨 AI Rock Art</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI로 창작한 Rock 테마 아트워크
          </p>
        </div>

        {/* Upload Button */}
        {user && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all font-medium"
            >
              {showUploadForm ? '취소' : '+ AI Rock Art 업로드'}
            </button>
          </div>
        )}

        {!user && (
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              AI Rock Art를 업로드하려면{' '}
              <a href="/auth/login" className="text-red-600 hover:text-red-500 font-medium">
                로그인
              </a>
              이 필요합니다.
            </p>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && user && (
          <div className="mb-12 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AI Rock Art 업로드
            </h2>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이미지 *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                    dark:file:bg-purple-900/20 dark:file:text-purple-400
                    dark:hover:file:bg-purple-900/30"
                  disabled={uploading}
                />
                {previewUrl && (
                  <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  placeholder="작품 제목"
                  required
                  disabled={uploading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  placeholder="AI로 생성한 작품에 대한 설명을 입력하세요"
                  rows={4}
                  disabled={uploading}
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    업로드 중... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : '업로드'}
              </button>
            </form>
          </div>
        )}

        {/* Artworks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : artworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-800 hover:shadow-xl transition-all group"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {artwork.title}
                  </h3>
                  {artwork.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>by {artwork.author}</span>
                    <span>{new Date(artwork.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {user && user.id === artwork.user_id && (
                    <button
                      onClick={() => handleDelete(artwork.id, artwork.image_url)}
                      className="mt-3 w-full px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-12 text-center">
            <div className="text-8xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Rock Art Gallery
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              아직 업로드된 AI Rock Art가 없습니다.
              <br />
              첫 번째 작품을 업로드해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
