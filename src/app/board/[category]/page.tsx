/**
 * Board Page (Dynamic Route) with Tailwind CSS
 * 카테고리별 게시판 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/useAdmin';

const CATEGORY_LABELS: Record<string, string> = {
  ai_study: 'AI 스터디',
  bigdata_study: '빅데이터 엔지니어 자격증 스터디',
  free_board: '자유게시판',
  ai_artwork: 'AI 작품 갤러리',
};

export default function BoardPage() {
  const params = useParams();
  const category = params?.category as string;
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [category]);

  const loadPosts = async () => {
    if (!category || !CATEGORY_LABELS[category]) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    setPosts(postsData || []);
    setLoading(false);
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setImageUrls(post.image_urls || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      alert('삭제에 실패했습니다.');
    } else {
      await loadPosts();
      alert('삭제되었습니다.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrls([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      // 수정
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim(),
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating post:', error);
        alert('수정에 실패했습니다.');
      } else {
        await loadPosts();
        resetForm();
        alert('수정되었습니다!');
      }
    } else {
      // 새로 작성
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        category: category,
        title: title.trim(),
        content: content.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      });

      if (error) {
        console.error('Error creating post:', error);
        alert('게시글 작성에 실패했습니다.');
      } else {
        await loadPosts();
        resetForm();
        alert('게시글이 작성되었습니다!');
      }
    }

    setSaving(false);
  };

  if (loading || adminLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!category || !CATEGORY_LABELS[category]) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            존재하지 않는 카테고리입니다
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
          {CATEGORY_LABELS[category]}
        </h1>
        {isAdmin && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            variant="primary"
            size="lg"
            className="whitespace-nowrap"
          >
            ✏️ 글쓰기
          </Button>
        )}
      </div>

      {/* Write/Edit Form */}
      {showForm && isAdmin && (
        <Card variant="featured" padding="lg" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? '게시글 수정' : '새 게시글 작성'}
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
                    formData.append('bucket', `board-${category}`);

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
                {saving ? (editingId ? '수정 중...' : '작성 중...') : (editingId ? '수정' : '게시글 작성')}
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

      {/* Post List */}
      {posts && posts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <Link href={`/board/${category}/${post.id}`} className="group">
                <Card
                  hoverable
                  padding="lg"
                  className="transition-all duration-200"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {post.title}
                  </h2>

                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-100">
                    <span>작성자: {post.author_id}</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    {post.view_count > 0 && (
                      <>
                        <span>•</span>
                        <span>조회 {post.view_count}</span>
                      </>
                    )}
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
                      handleEdit(post);
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
                      handleDelete(post.id);
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
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            아직 게시글이 없습니다
          </h2>
          <p className="text-gray-600 dark:text-white">
            첫 게시글을 작성해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
