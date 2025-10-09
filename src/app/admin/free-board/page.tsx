/**
 * Free Board Admin Page
 * 자유게시판 관리자 페이지 (작성/수정)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface PostForm {
  title: string;
  content: string;
  image_url: string;
}

function AdminFreeBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState<PostForm>({
    title: '',
    content: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 수정 모드인 경우 게시글 불러오기
      if (editId) {
        const { data } = await supabase
          .from('free_board')
          .select('*')
          .eq('id', editId)
          .single();

        if (data) {
          setFormData({
            title: data.title,
            content: data.content,
            image_url: data.image_url || '',
          });
        }
      }

      // 전체 게시글 목록 불러오기
      const { data: postsData } = await supabase
        .from('free_board')
        .select('*')
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
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
          .from('free_board')
          .update({
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);

        if (error) throw error;
        alert('수정되었습니다');
        router.push(`/free-board/${editId}`);
      } else {
        // 새 글 작성
        const { error } = await supabase.from('free_board').insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url || null,
        });

        if (error) throw error;
        alert('작성되었습니다');
        setFormData({ title: '', content: '', image_url: '' });
        router.push('/free-board');
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
    const { error } = await supabase.from('free_board').delete().eq('id', id);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setPosts(posts.filter((p) => p.id !== id));
      alert('삭제되었습니다');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        자유게시판 관리
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editId ? '게시글 수정' : '새 게시글 작성'}
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

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={10}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이미지 (선택)
              </label>
              <ImageUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, image_url: url })
                }
                currentImage={formData.image_url}
                bucket="free-board"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? '저장 중...' : editId ? '수정' : '작성'}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/admin/free-board')}
                >
                  취소
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Posts List */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            게시글 목록
          </h2>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회{' '}
                    {post.view_count}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/admin/free-board?edit=${post.id}`)}
                  >
                    수정
                  </Button>
                  <Button variant="secondary" onClick={() => handleDelete(post.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminFreeBoardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto text-center py-12 text-gray-600 dark:text-white">로딩 중...</div>}>
      <AdminFreeBoardContent />
    </Suspense>
  );
}
