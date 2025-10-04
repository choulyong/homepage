/**
 * IT News Page with Tailwind CSS
 * AI, 암호화폐 관련 IT 뉴스
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      const supabase = createClient();

      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      setNews(newsData || []);
      setLoading(false);
    };

    loadNews();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'ai':
        return 'bg-teal-500 text-white';
      case 'crypto':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-indigo-500 text-white';
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
          IT 뉴스
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          AI, 암호화폐, 기술 트렌드 최신 뉴스
        </p>
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
              className="group"
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
                          {item.category.toUpperCase()}
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
            아직 뉴스가 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            관리자가 뉴스를 추가하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
