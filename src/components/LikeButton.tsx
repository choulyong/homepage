'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  targetType: 'post' | 'gallery' | 'movie' | 'news';
  targetId: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function LikeButton({ targetType, targetId, size = 'md', showCount = true }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        // 사용자 확인
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 좋아요 상태 조회
        const response = await fetch(`/api/likes?targetType=${targetType}&targetId=${targetId}`);
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.count);
      } catch (error) {
        console.error('Failed to load like status:', error);
      }
    };

    loadLikeStatus();
  }, [targetType, targetId]);

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : Math.max(0, prev - 1));
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={loading}
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-200',
          sizeClasses[size],
          isLiked
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500',
          loading && 'opacity-50 cursor-not-allowed',
          'hover:scale-110 active:scale-95'
        )}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <svg
          className={cn(iconSizes[size], 'transition-transform')}
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      {showCount && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {likeCount}
        </span>
      )}
    </div>
  );
}
