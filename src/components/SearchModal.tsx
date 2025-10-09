'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchResult {
  posts: Array<{ id: number; board_id: string; title: string; content: string; created_at: string }>;
  news: Array<{ id: number; title: string; content: string; link: string; created_at: string }>;
  gallery: Array<{ id: number; title: string; description: string; image_url: string; created_at: string }>;
  movies: Array<{ id: number; title: string; description: string; poster_url: string; created_at: string }>;
  total: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
    setQuery('');
    setResults(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && results && results.total === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              "{query}"에 대한 검색 결과가 없습니다.
            </div>
          )}

          {!loading && results && results.total > 0 && (
            <div className="space-y-6">
              {/* 게시글 */}
              {results.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">게시글 ({results.posts.length})</h3>
                  <div className="space-y-2">
                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/board/${post.board_id}/${post.id}`}
                        onClick={handleLinkClick}
                        className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{post.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 뉴스 */}
              {results.news.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">뉴스 ({results.news.length})</h3>
                  <div className="space-y-2">
                    {results.news.map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.id}`}
                        onClick={handleLinkClick}
                        className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {item.content.substring(0, 100)}...
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 갤러리 */}
              {results.gallery.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">갤러리 ({results.gallery.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {results.gallery.map((item) => (
                      <Link
                        key={item.id}
                        href={`/gallery`}
                        onClick={handleLinkClick}
                        className="block group"
                      >
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                            <div className="text-white text-sm font-medium line-clamp-1">{item.title}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 영화 */}
              {results.movies.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">영화 ({results.movies.length})</h3>
                  <div className="space-y-2">
                    {results.movies.map((item) => (
                      <Link
                        key={item.id}
                        href={`/movies`}
                        onClick={handleLinkClick}
                        className="flex gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {item.poster_url && (
                          <img
                            src={item.poster_url}
                            alt={item.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !results && query && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              검색 중...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
