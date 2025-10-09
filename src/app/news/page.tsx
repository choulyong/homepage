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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  // 자동 새로고침 (5분마다)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadNews();
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, [autoRefresh, selectedCategory]);

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
    setLastUpdated(new Date());
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 뉴스 크롤링 API 호출
      const response = await fetch('/api/cron/news');
      if (response.ok) {
        // 크롤링 후 DB에서 새로운 뉴스 로드
        await loadNews();
      } else {
        alert('뉴스 새로고침에 실패했습니다.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      alert('뉴스 새로고침 중 오류가 발생했습니다.');
      setLoading(false);
    }
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
        <div className="text-center py-12 text-gray-600 dark:text-white">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
              뉴스
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              기술, 비즈니스, 세계, 과학, AI 등 다양한 분야의 최신 뉴스
            </p>
          </div>

          {/* Refresh Controls */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                loading
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95'
              )}
            >
              <svg
                className={cn('w-5 h-5', loading && 'animate-spin')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? '새로고침 중...' : '새로고침'}
            </button>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
              />
              자동 새로고침 (5분)
            </label>

            <p className="text-xs text-gray-500 dark:text-gray-100">
              마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
            </p>
          </div>
        </div>
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
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
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
                    <p className="text-sm text-gray-600 dark:text-white line-clamp-3 mb-4 flex-1">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-100">
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
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedCategory === 'all'
              ? '아직 뉴스가 없습니다'
              : `${CATEGORY_TABS.find(t => t.value === selectedCategory)?.label} 카테고리에 뉴스가 없습니다`}
          </h2>
          <p className="text-gray-600 dark:text-white">
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
                <div className="flex gap-2 items-center mt-1 text-sm text-gray-500 dark:text-white">
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
                  className="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200 transition-colors"
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
                <div className="flex flex-col h-full p-8">
                  {/* 뉴스 이미지 */}
                  {selectedNews.image_url && (
                    <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={selectedNews.image_url}
                        alt={selectedNews.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* 뉴스 요약 */}
                  {selectedNews.description && (
                    <div className="flex-1 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        📰 뉴스 요약
                      </h3>
                      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedNews.description}
                      </p>
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-white mb-4">
                      원문 전체를 보려면 새 탭에서 여세요
                    </p>
                    <a
                      href={selectedNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      원문 보기 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
