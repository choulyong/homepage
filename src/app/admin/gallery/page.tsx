/**
 * Gallery Admin Page
 * 갤러리 관리자 페이지 (작성/수정)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Image from 'next/image';

interface PhotoForm {
  title: string;
  description: string;
  image_url: string;
  taken_at: string;
}

function AdminGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState<PhotoForm>({
    title: '',
    description: '',
    image_url: '',
    taken_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 수정 모드인 경우 사진 불러오기
      if (editId) {
        const { data } = await supabase
          .from('gallery')
          .select('*')
          .eq('id', editId)
          .single();

        if (data) {
          setFormData({
            title: data.title,
            description: data.description || '',
            image_url: data.image_url || '',
            taken_at: data.taken_at ? data.taken_at.split('T')[0] : '',
          });
        }
      }

      // 전체 사진 목록 불러오기
      const { data: photosData } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      setPhotos(photosData || []);
    };

    loadData();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다');
        return;
      }

      if (editId) {
        // 수정
        const { error } = await supabase
          .from('gallery')
          .update({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url,
            taken_at: formData.taken_at || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);

        if (error) throw error;
        alert('수정되었습니다');
        router.push(`/gallery/${editId}`);
      } else {
        // 새 사진 추가
        const { error } = await supabase.from('gallery').insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url,
          taken_at: formData.taken_at || null,
        });

        if (error) throw error;
        alert('추가되었습니다');
        setFormData({ title: '', description: '', image_url: '', taken_at: '' });
        router.push('/gallery');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('gallery').delete().eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setPhotos(photos.filter((p) => p.id !== id));
      alert('삭제되었습니다');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        갤러리 관리
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editId ? '사진 수정' : '사진 추가'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명 (선택)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Taken At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                촬영일 (선택)
              </label>
              <input
                type="date"
                value={formData.taken_at}
                onChange={(e) =>
                  setFormData({ ...formData, taken_at: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Image (Required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                사진 (필수)
              </label>
              <ImageUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, image_url: url })
                }
                currentImage={formData.image_url}
                bucket="gallery"
              />
              <p className="text-xs text-gray-500 dark:text-gray-100 mt-2">
                * 원본 품질로 업로드됩니다
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.image_url}
              >
                {loading ? '저장 중...' : editId ? '수정' : '추가'}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/admin/gallery')}
                >
                  취소
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Photos List */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            사진 목록
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer"
                onClick={() => router.push(`/admin/gallery?edit=${photo.id}`)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4">
                    <p className="text-white text-sm font-medium text-center mb-2">
                      {photo.title}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/gallery?edit=${photo.id}`);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminGalleryPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto text-center py-12 text-gray-600 dark:text-white">로딩 중...</div>}>
      <AdminGalleryContent />
    </Suspense>
  );
}
