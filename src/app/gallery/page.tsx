/**
 * Gallery List Page (Public)
 * 갤러리 목록 페이지 (일상 사진)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/hooks/useAdmin';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  original_filename: string | null;
  taken_at: string | null;
  view_count: number;
  created_at: string;
}

export default function GalleryPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('taken_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading photos:', error);
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setTitle(photo.title);
    setDescription(photo.description || '');
    setImageUrl(photo.image_url);
    setTakenAt(photo.taken_at || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('gallery').delete().eq('id', id);

    if (error) {
      console.error('Error deleting photo:', error);
      alert('삭제에 실패했습니다.');
    } else {
      await loadPhotos();
      alert('삭제되었습니다.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTakenAt('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    try {
      setUploadingFiles(fileArray);

      // 각 파일 업로드
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const file of fileArray) {
        try {
          // 진행상황 업데이트
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

          // 파일 업로드
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', 'gallery');

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('업로드 실패');
          }

          const data = await response.json();

          // DB에 저장
          const { error } = await supabase.from('gallery').insert({
            user_id: user.id,
            title: file.name.replace(/\.[^/.]+$/, ''), // 확장자 제거
            description: null,
            image_url: data.url,
            taken_at: null,
          });

          if (error) {
            console.error('Error saving photo:', error);
            throw error;
          }

          // 진행상황 완료
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          successCount++;
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // 실패 표시
          failCount++;
        }
      }

      // 업로드 완료 후 리스트 새로고침
      await loadPhotos();

      // 상태 초기화
      setUploadingFiles([]);
      setUploadProgress({});

      // input 초기화
      e.target.value = '';

      // 결과 메시지
      if (failCount === 0) {
        alert(`${successCount}장의 사진이 업로드되었습니다!`);
      } else {
        alert(`${successCount}장 성공, ${failCount}장 실패`);
      }
    } catch (error) {
      console.error('File select error:', error);
      setUploadingFiles([]);
      setUploadProgress({});
      e.target.value = '';
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      // 수정
      const { error } = await supabase
        .from('gallery')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          taken_at: takenAt || null,
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating photo:', error);
        alert('수정에 실패했습니다.');
      } else {
        await loadPhotos();
        resetForm();
        alert('수정되었습니다!');
      }
    } else {
      // 새로 작성
      const { error } = await supabase.from('gallery').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        taken_at: takenAt || null,
      });

      if (error) {
        console.error('Error creating photo:', error);
        alert('사진 업로드에 실패했습니다.');
      } else {
        await loadPhotos();
        resetForm();
        alert('사진이 업로드되었습니다!');
      }
    }

    setSaving(false);
  };

  if (loading || adminLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
            갤러리
          </h1>
          <p className="text-lg text-gray-600 dark:text-white">
            일상의 순간을 원본 화질로 공유하세요
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="multipleFileInput"
            />
            <label htmlFor="multipleFileInput" className="inline-block">
              <div className="px-6 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 cursor-pointer transition-all duration-200 whitespace-nowrap">
                🖼️ 여러 장 한번에
              </div>
            </label>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              variant="primary"
              size="lg"
              className="whitespace-nowrap"
            >
              📷 사진 올리기
            </Button>
          </div>
        )}
      </div>

      {/* 업로드 진행 상황 */}
      {uploadingFiles.length > 0 && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            업로드 진행 중... ({Object.keys(uploadProgress).filter(k => uploadProgress[k] === 100).length} / {uploadingFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {file.name}
                </span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      uploadProgress[file.name] === 100
                        ? 'bg-green-500'
                        : uploadProgress[file.name] === -1
                        ? 'bg-red-500'
                        : 'bg-teal-500'
                    )}
                    style={{ width: `${Math.max(0, uploadProgress[file.name] || 0)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                  {uploadProgress[file.name] === -1 ? '실패' : `${uploadProgress[file.name] || 0}%`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Write/Edit Form */}
      {showForm && isAdmin && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? '사진 수정' : '새 사진 업로드'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="사진에 대한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                촬영 날짜
              </label>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                사진 * (원본 화질 유지)
              </label>
              <ImageUpload
                onUploadComplete={setImageUrl}
                currentImageUrl={imageUrl}
                bucket="gallery"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                {saving ? (editingId ? '수정 중...' : '업로드 중...') : (editingId ? '수정' : '사진 업로드')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white mb-4">
            아직 사진이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <Link href={`/gallery/${photo.id}`}>
                <Card
                  variant="featured"
                  padding="none"
                  className="overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={photo.image_url}
                      alt={photo.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {photo.title}
                        </h3>
                        {photo.taken_at && (
                          <p className="text-white/90 text-sm">
                            {new Date(photo.taken_at).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 z-50">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(photo);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors pointer-events-auto"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors pointer-events-auto"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
