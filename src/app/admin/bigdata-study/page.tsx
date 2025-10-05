/**
 * Admin BigData Study Management - Tailwind CSS
 * 빅데이터 스터디 게시판 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Post {
  id?: string;
  title: string;
  content: string;
  thumbnail_url?: string;
  category: string;
  user_id?: string;
  view_count?: number;
  created_at?: string;
}

export default function AdminBigDataStudyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Post>({
    title: '',
    content: '',
    thumbnail_url: '',
    category: 'bigdata_study',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'bigdata_study')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage({ type: 'error', text: '게시글을 불러오는데 실패했습니다.' });
    } else {
      setPosts(data || []);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, thumbnail_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('로그인이 필요합니다');

      if (editingPost?.id) {
        // 수정
        const { error } = await supabase
          .from('posts')
          .update({
            title: formData.title,
            content: formData.content,
            thumbnail_url: formData.thumbnail_url,
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        setMessage({ type: 'success', text: '게시글이 수정되었습니다!' });
      } else {
        // 새로 작성
        const { error } = await supabase.from('posts').insert({
          title: formData.title,
          content: formData.content,
          thumbnail_url: formData.thumbnail_url,
          category: 'bigdata_study',
          user_id: user.id,
        });

        if (error) throw error;
        setMessage({ type: 'success', text: '게시글이 작성되었습니다!' });
      }

      resetForm();
      loadPosts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '작업에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      thumbnail_url: post.thumbnail_url || '',
      category: 'bigdata_study',
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('posts').delete().eq('id', postId);

      if (error) throw error;

      setMessage({ type: 'success', text: '게시글이 삭제되었습니다.' });
      loadPosts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      thumbnail_url: '',
      category: 'bigdata_study',
    });
    setEditingPost(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          빅데이터 스터디 관리
        </h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '목록으로' : '+ 새 게시글 작성'}
        </Button>
      </div>

      {message && (
        <div
          className={cn(
            'p-4 rounded-md mb-4 border',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          )}
        >
          {message.text}
        </div>
      )}

      {/* 게시글 작성/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">
              {editingPost ? '게시글 수정' : '새 게시글 작성'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 썸네일 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  썸네일 이미지
                </label>
                <ImageUpload
                  currentImageUrl={formData.thumbnail_url}
                  onUploadComplete={handleImageUpload}
                  bucket="posts"
                  maxSizeMB={5}
                />
              </div>

              {/* 게시글 정보 */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="게시글 제목"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    내용 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="게시글 내용"
                    rows={8}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 resize-y font-[inherit]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" type="button" onClick={resetForm}>
                취소
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? '저장 중...' : editingPost ? '수정 완료' : '작성 완료'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 게시글 목록 */}
      {!showForm && (
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg overflow-hidden">
          {posts.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-white/15 border-b-2 border-white/10">
                <tr>
                  <th className="w-[40%] p-4 text-left text-sm font-semibold text-gray-300">
                    제목
                  </th>
                  <th className="w-[15%] p-4 text-left text-sm font-semibold text-gray-300">
                    조회수
                  </th>
                  <th className="w-[20%] p-4 text-left text-sm font-semibold text-gray-300">
                    작성일
                  </th>
                  <th className="w-[25%] p-4 text-left text-sm font-semibold text-gray-300">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-white/10 transition-all duration-200 hover:bg-white/10"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.thumbnail_url && (
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                        <span className="text-sm text-gray-300">{post.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{post.view_count || 0}</td>
                    <td className="p-4 text-sm text-gray-300">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id!)}
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-12 text-gray-400">
              <h2 className="text-xl font-semibold mb-2">게시글이 없습니다</h2>
              <p>새 게시글을 작성해보세요!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
