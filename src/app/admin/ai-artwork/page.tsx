/**
 * Admin AI Artwork Gallery Management - Tailwind CSS
 * AI 작품 갤러리 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Artwork {
  id?: string;
  title: string;
  content: string;
  thumbnail_url?: string;
  category: string;
  user_id?: string;
  view_count?: number;
  created_at?: string;
}

export default function AdminAIArtworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Artwork>({
    title: '',
    content: '',
    thumbnail_url: '',
    category: 'ai_artwork',
  });

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'ai_artwork')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage({ type: 'error', text: '작품을 불러오는데 실패했습니다.' });
    } else {
      setArtworks(data || []);
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

      if (editingArtwork?.id) {
        // 수정
        const { error } = await supabase
          .from('posts')
          .update({
            title: formData.title,
            content: formData.content,
            thumbnail_url: formData.thumbnail_url,
          })
          .eq('id', editingArtwork.id);

        if (error) throw error;
        setMessage({ type: 'success', text: '작품이 수정되었습니다!' });
      } else {
        // 새로 작성
        const { error } = await supabase.from('posts').insert({
          title: formData.title,
          content: formData.content,
          thumbnail_url: formData.thumbnail_url,
          category: 'ai_artwork',
          user_id: user.id,
        });

        if (error) throw error;
        setMessage({ type: 'success', text: '작품이 등록되었습니다!' });
      }

      resetForm();
      loadArtworks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '작업에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      content: artwork.content,
      thumbnail_url: artwork.thumbnail_url || '',
      category: 'ai_artwork',
    });
    setShowForm(true);
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm('이 작품을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('posts').delete().eq('id', artworkId);

      if (error) throw error;

      setMessage({ type: 'success', text: '작품이 삭제되었습니다.' });
      loadArtworks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      thumbnail_url: '',
      category: 'ai_artwork',
    });
    setEditingArtwork(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          AI 작품 갤러리 관리
        </h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '목록으로' : '+ 새 작품 등록'}
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

      {/* 작품 등록/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">
              {editingArtwork ? '작품 수정' : '새 작품 등록'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 작품 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  작품 이미지 *
                </label>
                <ImageUpload
                  currentImageUrl={formData.thumbnail_url}
                  onUploadComplete={handleImageUpload}
                  bucket="artworks"
                  maxSizeMB={10}
                />
              </div>

              {/* 작품 정보 */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    작품 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="작품 제목"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    작품 설명 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="작품에 대한 설명 (생성 프롬프트, 사용한 AI 모델, 제작 의도 등)"
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
                {loading ? '저장 중...' : editingArtwork ? '수정 완료' : '등록 완료'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 작품 갤러리 그리드 */}
      {!showForm && (
        <>
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg overflow-hidden hover:border-teal-500/50 transition-all duration-200"
                >
                  {/* 작품 이미지 */}
                  {artwork.thumbnail_url && (
                    <div className="aspect-square w-full overflow-hidden bg-gray-800">
                      <img
                        src={artwork.thumbnail_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* 작품 정보 */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{artwork.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{artwork.content}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>조회 {artwork.view_count || 0}</span>
                      <span>
                        {artwork.created_at
                          ? new Date(artwork.created_at).toLocaleDateString('ko-KR')
                          : '-'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(artwork)}
                        fullWidth
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(artwork.id!)}
                        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        fullWidth
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg text-center p-12 text-gray-400">
              <h2 className="text-xl font-semibold mb-2">등록된 작품이 없습니다</h2>
              <p>새 작품을 등록해보세요!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
