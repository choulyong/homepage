/**
 * News Page with Tailwind CSS
 * 다양한 분야의 글로벌 뉴스
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type CategoryFilter = 'all' | 'tech' | 'business' | 'world' | 'science' | 'ai' | 'korea';

const CATEGORY_TABS = [
  { value: 'all', label: '전체', color: 'teal' },
  { value: 'tech', label: '기술', color: 'blue' },
  { value: 'business', label: '비즈니스', color: 'green' },
  { value: 'world', label: '세계', color: 'purple' },
  { value: 'science', label: '과학', color: 'pink' },
  { value: 'ai', label: 'AI', color: 'teal' },
  { value: 'korea', label: '한국', color: 'red' },
] as const;

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNews(null);
        setIframeError(false);
      }
    };

    if (selectedNews) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedNews]);

  const loadNews = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    // 카테고리 필터 적용
    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data: newsData } = await query;

    setNews(newsData || []);
    setLoading(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tech':
        return 'bg-blue-500 text-white';
      case 'business':
        return 'bg-green-500 text-white';
      case 'world':
        return 'bg-purple-500 text-white';
      case 'science':
        return 'bg-pink-500 text-white';
      case 'ai':
        return 'bg-teal-500 text-white';
      case 'korea':
        return 'bg-red-500 text-white';
      default:
        return 'bg-indigo-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tech':
        return '기술';
      case 'business':
        return '비즈니스';
      case 'world':
        return '세계';
      case 'science':
        return '과학';
      case 'ai':
        return 'AI';
      case 'korea':
        return '한국';
      default:
        return category?.toUpperCase() || '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
          뉴스
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          기술, 비즈니스, 세계, 과학, AI 등 다양한 분야의 최신 뉴스
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value as CategoryFilter)}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              selectedCategory === tab.value
                ? 'bg-gradient-to-r from-teal-500 to-indigo-400 text-white shadow-lg scale-105'
                : 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedNews(item);
                setIframeError(false);
              }}
              className="group cursor-pointer"
            >
              <Card
                hoverable
                padding="none"
                className="h-full flex flex-col overflow-hidden"
              >
                {/* News Image */}
                {item.image_url && (
                  <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* News Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex gap-2 items-center">
                      {item.category && (
                        <span className={cn('px-3 py-1 rounded-full font-medium', getCategoryColor(item.category))}>
                          {getCategoryLabel(item.category)}
                        </span>
                      )}
                      {item.source && <span>{item.source}</span>}
                    </div>
                    {item.published_at && (
                      <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedCategory === 'all'
              ? '아직 뉴스가 없습니다'
              : `${CATEGORY_TABS.find(t => t.value === selectedCategory)?.label} 카테고리에 뉴스가 없습니다`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedCategory === 'all'
              ? '자동 크롤링이 실행되면 뉴스가 표시됩니다.'
              : '다른 카테고리를 선택하거나 자동 크롤링을 기다려주세요.'}
          </p>
        </div>
      )}

      {/* News Viewer Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedNews(null);
            setIframeError(false);
          }}
        >
          <div
            className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                  {selectedNews.title}
                </h2>
                <div className="flex gap-2 items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className={cn('px-2 py-0.5 rounded text-xs', getCategoryColor(selectedNews.category))}>
                    {getCategoryLabel(selectedNews.category)}
                  </span>
                  {selectedNews.source && <span>{selectedNews.source}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  새 탭으로 열기
                </a>
                <button
                  onClick={() => {
                    setSelectedNews(null);
                    setIframeError(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
              {!iframeError ? (
                <iframe
                  src={selectedNews.url}
                  className="w-full h-full border-0"
                  title={selectedNews.title}
                  onError={() => setIframeError(true)}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    페이지를 표시할 수 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    일부 뉴스 사이트는 보안 정책상 iframe으로 표시할 수 없습니다.
                  </p>
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    새 탭에서 열기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
