/**
 * AshDish Page
 * AshDish 콘텐츠 공유 공간
 */

'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';

interface AshDishPost {
  id: string;
  title: string;
  content: string | null;
  author: string;
  user_id: string | null;
  video_type: string | null;
  youtube_url: string | null;
  video_url: string | null;
  image_urls: string[];
  view_count: number;
  like_count: number;
  created_at: string;
}

export default function AshDishPage() {
  const [posts, setPosts] = useState<AshDishPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
    loadUser();

    // 로그인 이벤트 리스너 추가
    const handleLoginEvent = () => {
      console.log('🔔 Login event received in AshDish - reloading user');
      loadUser();
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, []);

  const loadUser = () => {
    const currentUser = getCurrentUser();
    console.log('🔐 AshDish - localStorage user:', currentUser);
    setUser(currentUser);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ashdish');
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
      } else {
        console.error('Error loading posts:', data.error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = searchQuery
    ? posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎬 AshDish</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AshDish 콘텐츠를 공유해보세요
          </p>
        </div>

        {/* 검색 및 글쓰기 버튼 */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* 검색 */}
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="제목, 내용, 작성자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* 글쓰기 버튼 */}
          {user ? (
            <Link href="/ashdish/new">
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium whitespace-nowrap">
                + 글쓰기
              </button>
            </Link>
          ) : (
            <Link href="/auth/login?redirect=/ashdish/new">
              <button className="w-full sm:w-auto px-6 py-3 bg-gray-400 text-white rounded-lg shadow-lg font-medium whitespace-nowrap">
                로그인 후 작성 가능
              </button>
            </Link>
          )}
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/ashdish/${post.id}`}
                className="group"
              >
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-800 overflow-hidden h-full flex flex-col">
                  {/* 썸네일 영역 */}
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-zinc-800">
                    {post.video_type === 'youtube' && post.youtube_url ? (
                      // YouTube 썸네일
                      <div className="relative w-full h-full">
                        <Image
                          src={`https://img.youtube.com/vi/${extractYouTubeVideoId(post.youtube_url)}/mqdefault.jpg`}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : post.video_type === 'upload' && post.video_url ? (
                      // 업로드된 동영상 썸네일
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={post.video_url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : post.image_urls && post.image_urls.length > 0 ? (
                      // 이미지
                      <Image
                        src={post.image_urls[0]}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      // 기본 이미지
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎵
                      </div>
                    )}
                  </div>

                  {/* 게시글 정보 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {post.title}
                    </h3>
                    {post.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-3">
                        <span>👀 {post.view_count}</span>
                        <span>❤️ {post.like_count}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              아직 게시글이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              첫 번째 콘텐츠를 공유해보세요!
            </p>
            {user && (
              <Link href="/ashdish/new">
                <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium">
                  + 글쓰기
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
