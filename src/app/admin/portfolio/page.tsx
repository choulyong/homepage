/**
 * Admin Portfolio Management - Tailwind CSS
 * 포트폴리오 항목 관리 페이지 (이미지 직접 업로드 지원)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  tags?: string[];
  order_index?: number;
}

export default function AdminPortfolioPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadPortfolioItems();
  }, []);

  const loadPortfolioItems = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('portfolio')
      .select('*')
      .order('order_index', { ascending: true });

    if (data) {
      setPortfolioItems(data);
    }
  };

  const addNewItem = () => {
    setPortfolioItems([
      ...portfolioItems,
      {
        title: '',
        description: '',
        image_url: '',
        link: '',
        tags: [],
        order_index: portfolioItems.length,
      },
    ]);
    setEditingIndex(portfolioItems.length);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...portfolioItems];
    updated[index] = { ...updated[index], [field]: value };
    setPortfolioItems(updated);
  };

  const handleImageUpload = (index: number, url: string) => {
    updateItem(index, 'image_url', url);
  };

  const saveItem = async (index: number) => {
    const item = portfolioItems[index];

    if (!item.title || !item.description) {
      setMessage({ type: 'error', text: '제목과 설명은 필수입니다.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      if (item.id) {
        // 업데이트
        const { error } = await supabase
          .from('portfolio')
          .update({
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            link: item.link,
            tags: item.tags,
            order_index: item.order_index,
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // 새로 생성
        const { data, error } = await supabase.from('portfolio').insert({
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          link: item.link,
          tags: item.tags,
          order_index: item.order_index,
        }).select().single();

        if (error) throw error;

        // ID 업데이트
        const updated = [...portfolioItems];
        updated[index] = { ...updated[index], id: data.id };
        setPortfolioItems(updated);
      }

      setMessage({ type: 'success', text: '포트폴리오 항목이 저장되었습니다!' });
      setEditingIndex(null);
      loadPortfolioItems();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (index: number) => {
    const item = portfolioItems[index];

    if (!item.id) {
      // 아직 저장되지 않은 항목은 바로 제거
      setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
      return;
    }

    if (!confirm('이 포트폴리오 항목을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('portfolio').delete().eq('id', item.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '항목이 삭제되었습니다.' });
      loadPortfolioItems();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          포트폴리오 관리
        </h1>
        <Button variant="primary" onClick={addNewItem}>
          + 새 항목 추가
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

      <div className="flex flex-col gap-6">
        {portfolioItems.map((item, index) => (
          <div
            key={item.id || `new-${index}`}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 왼쪽: 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  프로젝트 이미지 *
                </label>
                <ImageUpload
                  currentImageUrl={item.image_url}
                  onUploadComplete={(url) => handleImageUpload(index, url)}
                  bucket="portfolio"
                  maxSizeMB={10}
                />
              </div>

              {/* 오른쪽: 정보 입력 */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    프로젝트 제목 *
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="프로젝트 이름"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    설명 *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="프로젝트 설명"
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 resize-y font-[inherit]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    프로젝트 링크 (선택)
                  </label>
                  <input
                    type="url"
                    value={item.link || ''}
                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-6 justify-end">
              <Button
                variant="outline"
                onClick={() => deleteItem(index)}
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                삭제
              </Button>
              <Button variant="primary" onClick={() => saveItem(index)} disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        ))}

        {portfolioItems.length === 0 && (
          <div className="text-center p-12 text-gray-400">
            <h2 className="text-xl font-semibold mb-2">포트폴리오 항목이 없습니다</h2>
            <p>새 항목을 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
