/**
 * Free Board List Page (Public)
 * 자유게시판 목록 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  content: string;
  nickname: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  view_count: number;
  created_at: string;
}

export default function FreeBoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 사용자 정보 가져오기
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 게시글 목록 가져오기
      const { data, error } = await supabase
        .from('free_board')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleWriteClick = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 닉네임과 비밀번호 필수 입력
    if (!title.trim() || !content.trim() || !nickname.trim() || !password.trim()) {
      alert('제목, 내용, 닉네임, 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (password.length < 4) {
      alert('비밀번호는 4자 이상 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      // 비밀번호 해싱을 위한 API 호출
      const response = await fetch('/api/free-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          nickname: nickname.trim(),
          password: password,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          user_id: user?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('게시글 작성에 실패했습니다.');
      }

      // 목록 새로고침
      const supabase = createClient();
      const { data: newPosts } = await supabase
        .from('free_board')
        .select('*')
        .order('created_at', { ascending: false });

      if (newPosts) setPosts(newPosts);

      // 폼 초기화
      setTitle('');
      setContent('');
      setNickname('');
      setPassword('');
      setImageUrls([]);
      setShowForm(false);
      alert('게시글이 작성되었습니다!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시글 작성에 실패했습니다.');
    }

    setSaving(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
            자유게시판
          </h1>
          <p className="text-lg text-gray-600 dark:text-white">
            자유롭게 이야기를 나누는 공간입니다
          </p>
        </div>
        <Button
          onClick={handleWriteClick}
          variant="primary"
          size="lg"
          className="whitespace-nowrap"
        >
          ✏️ 글쓰기
        </Button>
      </div>

      {/* Write Form */}
      {showForm && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            새 게시글 작성
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  닉네임 *
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="닉네임 (최대 20자)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  비밀번호 * (수정/삭제 시 필요)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="비밀번호 (4~20자)"
                />
              </div>
            </div>

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
                내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="내용을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                이미지 (선택, 다중 업로드 가능)
              </label>

              {/* 이미지 미리보기 */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={url} alt={`이미지 ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 파일 업로드 버튼 */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;

                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('bucket', 'free-board');

                    try {
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });

                      if (response.ok) {
                        const data = await response.json();
                        setImageUrls((prev) => [...prev, data.url]);
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      alert('이미지 업로드에 실패했습니다.');
                    }
                  }
                  e.target.value = '';
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                {saving ? '작성 중...' : '게시글 작성'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-white mb-4">
            아직 게시글이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/free-board/${post.id}`}>
              <Card
                variant="featured"
                padding="none"
                className="overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full"
              >
                {(post.image_urls && post.image_urls.length > 0) ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={post.image_urls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : post.image_url ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white line-clamp-3 mb-4">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-100">
                    <span>
                      {post.nickname || '익명'} • {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <span>조회 {post.view_count}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
