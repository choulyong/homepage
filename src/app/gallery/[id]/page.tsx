/**
 * Gallery Detail Page (Public)
 * 갤러리 상세 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LikeButton } from '@/components/LikeButton';
import { CommentsSection } from '@/components/CommentsSection';
import Image from 'next/image';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  original_filename: string | null;
  file_size: number | null;
  taken_at: string | null;
  view_count: number;
  created_at: string;
  user_id: string;
}

export default function GalleryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      const supabase = createClient();

      // 현재 사용자 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 사진 가져오기
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading photo:', error);
        router.push('/gallery');
      } else {
        setPhoto(data);

        // 조회수 증가
        await supabase
          .from('gallery')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', params.id);
      }
      setLoading(false);
    };

    loadPhoto();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('gallery').delete().eq('id', params.id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      router.push('/gallery');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white">사진을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === photo.user_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.back()}>
          ← 목록으로
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <Image
                src={photo.image_url}
                alt={photo.title}
                fill
                className="object-contain bg-gray-900"
                quality={100}
              />
            </div>
          </Card>
        </div>

        {/* Info */}
        <div>
          <Card padding="lg">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {photo.title}
            </h1>

            {/* Description */}
            {photo.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {photo.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-white mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {photo.taken_at && (
                <p>
                  📅 촬영일:{' '}
                  {new Date(photo.taken_at).toLocaleDateString('ko-KR')}
                </p>
              )}
              <p>
                📁 파일명: {photo.original_filename || '알 수 없음'}
              </p>
              {photo.file_size && (
                <p>
                  💾 크기: {(photo.file_size / 1024 / 1024).toFixed(2)}MB
                </p>
              )}
              <p>👁️ 조회: {photo.view_count}</p>
              <p>
                🕐 업로드:{' '}
                {new Date(photo.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>

            {/* Like Button */}
            <div className="mb-4">
              <LikeButton targetType="gallery" targetId={parseInt(photo.id)} />
            </div>

            {/* Download Button */}
            <a
              href={photo.image_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="block w-full mb-4"
            >
              <Button variant="primary" className="w-full">
                원본 다운로드
              </Button>
            </a>

            {/* Action Buttons (Author Only) */}
            {isAuthor && (
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => router.push(`/admin/gallery?edit=${photo.id}`)}
                  className="flex-1"
                >
                  수정
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  className="flex-1"
                >
                  삭제
                </Button>
              </div>
            )}

            {/* Comments Section */}
            <CommentsSection targetType="gallery" targetId={parseInt(photo.id)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
