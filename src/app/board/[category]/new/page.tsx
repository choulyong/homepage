/**
 * Board New Post Page - METALDRAGON Rock Community
 * 게시글 작성 페이지
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Rock Community 게시판 카테고리 (Music Discovery, Rock Art Showcase 제거됨)
const CATEGORIES: Record<string, { name: string; description: string; icon: string }> = {
  'general_discussion': {
    name: 'General Discussion',
    description: 'Rock 음악에 대한 자유로운 토론',
    icon: '💬',
  },
  'album_reviews': {
    name: 'Album Reviews',
    description: '앨범 리뷰 및 평가',
    icon: '💿',
  },
  'concert_reviews': {
    name: 'Concert Reviews',
    description: '공연 후기 및 리뷰',
    icon: '🎤',
  },
  'hot_topics': {
    name: 'Hot Topics',
    description: '뜨거운 Rock 이슈',
    icon: '🔥',
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function BoardNewPostPage({ params }: PageProps) {
  const { category } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        alert('로그인이 필요합니다. 우측 상단에서 로그인해주세요.');
        router.push(`/board/${category}`);
        return;
      }

      // 관리자 확인
      setIsAdmin(data.user.isAdmin || false);
      setLoading(false);
    };

    checkAuth();
  }, [category, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', `board-${category}`);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setImageUrls((prev) => [...prev, data.url]);
        } else {
          alert('파일 업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      }
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      // 현재 사용자 정보 가져오기
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();

      if (!userData.user) {
        alert('로그인이 필요합니다.');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/board/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category,
          author: userData.user.username,
          user_id: userData.user.id,
          image_urls: imageUrls,
          is_pinned: isAdmin ? isPinned : false,
        }),
      });

      if (response.ok) {
        alert('게시글이 작성되었습니다!');
        router.push(`/board/${category}`);
      } else {
        const error = await response.json();
        alert('게시글 작성에 실패했습니다: ' + error.message);
        setSaving(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시글 작성 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  // 카테고리 유효성 검증
  if (!CATEGORIES[category]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            잘못된 카테고리입니다
          </h2>
          <Link
            href="/board"
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            게시판 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES[category];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/board/${category}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            ← 목록으로
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-red-500 via-amber-500 to-purple-500 py-12 px-8">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative text-center">
              <div className="text-5xl mb-3">{categoryInfo.icon}</div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
                새 글 작성
              </h1>
              <p className="text-lg text-white/90">{categoryInfo.name}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* 관리자 전용 - 공지 고정 옵션 */}
            {isAdmin && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="isPinned" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  📌 공지로 고정 (게시판 맨 위에 표시됩니다)
                </label>
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="게시글 제목을 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {title.length} / 200
              </div>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                placeholder="게시글 내용을 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-y"
              />
            </div>

            {/* 이미지/파일 업로드 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                이미지/파일 (선택, 다중 업로드 가능)
              </label>

              {/* 파일 미리보기 */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imageUrls.map((url, index) => {
                    const fileExt = url.split('.').pop()?.toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(fileExt || '');
                    const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'].includes(fileExt || '');

                    return (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                        {isImage ? (
                          <img src={url} alt={`파일 ${index + 1}`} className="w-full h-full object-cover" />
                        ) : isVideo ? (
                          <video src={url} className="w-full h-full object-cover" controls />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <div className="text-4xl mb-2">📄</div>
                            <div className="text-xs text-center text-gray-600 dark:text-gray-400 break-all">
                              {url.split('/').pop()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              .{fileExt}
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 파일 업로드 버튼 */}
              <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <span className="text-2xl">📁</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  파일 선택 (클릭 또는 드래그)
                </span>
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                이미지, 동영상, 문서 등 모든 파일 형식 지원 (최대 10MB)
              </p>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 via-amber-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? '작성 중...' : '✏️ 게시글 작성'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
