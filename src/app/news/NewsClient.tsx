'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

type CategoryFilter = 'all' | 'rock' | 'metal' | 'audio' | 'gear' | 'interface' | 'guitar' | 'concert' | 'album' | 'festival';

const CATEGORY_TABS = [
  { value: 'all', label: '전체', color: 'red' },
  { value: 'rock', label: '록 뉴스', color: 'red' },
  { value: 'metal', label: '메탈', color: 'purple' },
  { value: 'audio', label: '오디오 장비', color: 'blue' },
  { value: 'gear', label: '기타/앰프', color: 'amber' },
  { value: 'interface', label: '오디오 인터페이스', color: 'teal' },
  { value: 'concert', label: '콘서트', color: 'orange' },
  { value: 'album', label: '앨범 발매', color: 'pink' },
  { value: 'festival', label: '페스티벌', color: 'emerald' },
  { value: 'guitar', label: '기타 리뷰', color: 'cyan' },
] as const;

interface News {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  category: string;
  published_at: Date;
  created_at: Date;
}

interface Props {
  initialNews: News[];
}

export default function NewsClient({ initialNews }: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<News[]>(initialNews);
  const [loading, setLoading] = useState(false);

  // Auto-refresh every 30 seconds
  const { lastRefreshTime, isRefreshing: autoRefreshing } = useAutoRefresh({
    interval: 30000,
    enabled: true,
  });

  // Load news from API
  useEffect(() => {
    if (initialNews.length === 0) {
      loadNews();
    }
  }, [initialNews.length]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call crawler API to fetch new news
      const crawlerResponse = await fetch('/api/news/crawl', {
        method: 'POST',
      });

      if (!crawlerResponse.ok) {
        throw new Error('Failed to crawl news');
      }

      // Wait a bit for crawling to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reload news from database
      await loadNews();

      // Refresh the page data
      router.refresh();

      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'rock':
        return 'bg-red-500 text-white';
      case 'metal':
        return 'bg-purple-500 text-white';
      case 'audio':
        return 'bg-blue-500 text-white';
      case 'gear':
        return 'bg-amber-500 text-white';
      case 'interface':
        return 'bg-teal-500 text-white';
      case 'concert':
        return 'bg-orange-500 text-white';
      case 'album':
        return 'bg-pink-500 text-white';
      case 'festival':
        return 'bg-emerald-500 text-white';
      case 'guitar':
        return 'bg-cyan-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    const tab = CATEGORY_TABS.find(t => t.value === category.toLowerCase());
    return tab?.label || category;
  };

  // Filter news by category and sort by latest first
  const filteredNews = (selectedCategory === 'all'
    ? news
    : news.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase())
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
              🎸 Rock & Audio News
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              최신 록 음악 뉴스, 오디오 장비, 기타/앰프 리뷰, 콘서트 및 페스티벌 소식
            </p>
            {/* Auto-refresh status */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  autoRefreshing ? "bg-green-400" : "bg-blue-400"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  autoRefreshing ? "bg-green-500" : "bg-blue-500"
                )}></span>
              </span>
              {autoRefreshing ? '업데이트 중...' : '자동 새로고침 활성화'}
            </p>
          </div>

          {/* Admin Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
              refreshing
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
            )}
          >
            <svg
              className={cn('w-5 h-5', refreshing && 'animate-spin')}
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
            {refreshing ? '새로고침 중...' : '새로고침'}
          </button>
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
                ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg scale-105'
                : 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filteredNews && filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
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
                {/* News Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-1">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
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
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedCategory === 'all'
              ? '아직 뉴스가 없습니다'
              : `${CATEGORY_TABS.find(t => t.value === selectedCategory)?.label} 카테고리에 뉴스가 없습니다`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedCategory === 'all'
              ? '관리자가 새로고침 버튼을 눌러 뉴스를 크롤링하면 표시됩니다.'
              : '다른 카테고리를 선택해주세요.'}
          </p>
        </div>
      )}
    </div>
  );
}
