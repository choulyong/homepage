/**
 * Admin News Management - Tailwind CSS
 * 뉴스 관리 페이지 - 다양한 분야의 공신력 있는 RSS Feed
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { crawlAllNews, crawlNewsByCategory } from '@/app/actions/crawl';
import { cn } from '@/lib/utils';

type NewsCategory = 'technology' | 'business' | 'world' | 'science' | 'ai' | 'korea';

const CATEGORY_OPTIONS = [
  { value: 'technology', label: '기술 (TechCrunch, The Verge, Ars Technica)' },
  { value: 'business', label: '비즈니스 (Reuters Business)' },
  { value: 'world', label: '세계 (BBC World, Reuters World)' },
  { value: 'science', label: '과학 (Science Daily)' },
  { value: 'ai', label: 'AI (Google News AI)' },
  { value: 'korea', label: '한국 (Google News Korea)' },
];

export default function AdminNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('technology');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [news, setNews] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    source: '',
    imageUrl: '',
    category: 'tech',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  // 뉴스 목록 로드
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20);

    if (data) setNews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('news').insert({
        title: formData.title,
        description: formData.description,
        url: formData.url,
        source: formData.source,
        image_url: formData.imageUrl,
        category: formData.category,
        published_at: formData.publishedAt,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '뉴스가 추가되었습니다!' });
      setFormData({
        title: '',
        description: '',
        url: '',
        source: '',
        imageUrl: '',
        category: 'tech',
        publishedAt: new Date().toISOString().split('T')[0],
      });

      loadNews();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '뉴스 추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 뉴스를 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '뉴스가 삭제되었습니다.' });
      loadNews();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  const handleCrawlAll = async () => {
    setCrawling(true);
    setMessage(null);

    try {
      const result = await crawlAllNews();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadNews();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '전체 크롤링에 실패했습니다.' });
    } finally {
      setCrawling(false);
    }
  };

  const handleCrawlByCategory = async () => {
    setCrawling(true);
    setMessage(null);

    try {
      const result = await crawlNewsByCategory(selectedCategory);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadNews();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '카테고리 크롤링에 실패했습니다.' });
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
            뉴스 관리
          </h1>
          <Button variant="primary" onClick={handleCrawlAll} disabled={crawling}>
            {crawling ? '크롤링 중...' : '🔄 전체 뉴스 크롤링'}
          </Button>
        </div>

        {/* 카테고리별 크롤링 */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">카테고리별 크롤링</h3>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as NewsCategory)}
              className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleCrawlByCategory} disabled={crawling}>
              {crawling ? '크롤링 중...' : '선택 카테고리 크롤링'}
            </Button>
          </div>
        </div>
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

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl text-white mb-4">새 뉴스 추가</h2>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="title" className="text-sm font-medium text-gray-300">
              제목 *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="description" className="text-sm font-medium text-gray-300">
              설명
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white min-h-[100px] resize-y font-[inherit] focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="url" className="text-sm font-medium text-gray-300">
              뉴스 URL *
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="source" className="text-sm font-medium text-gray-300">
              출처
            </label>
            <input
              id="source"
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="TechCrunch, The Verge..."
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="imageUrl" className="text-sm font-medium text-gray-300">
              이미지 URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="category" className="text-sm font-medium text-gray-300">
              카테고리
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            >
              <option value="tech">기술 (Tech)</option>
              <option value="business">비즈니스 (Business)</option>
              <option value="world">세계 (World)</option>
              <option value="science">과학 (Science)</option>
              <option value="ai">AI</option>
              <option value="korea">한국 (Korea)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="publishedAt" className="text-sm font-medium text-gray-300">
              발행일
            </label>
            <input
              id="publishedAt"
              type="date"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} fullWidth>
            {loading ? '추가 중...' : '뉴스 추가'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl text-white mb-4">최근 뉴스</h2>
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-400 hover:underline"
              >
                {item.url}
              </a>
            </div>
            <Button variant="outline" onClick={() => handleDelete(item.id)}>
              삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
