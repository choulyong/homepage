/**
 * Auto-refresh hook for dynamic content updates
 * Automatically refreshes data at specified intervals
 */

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoRefreshOptions {
  /**
   * Refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;

  /**
   * Whether auto-refresh is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback function to run on each refresh (optional)
   */
  onRefresh?: () => void | Promise<void>;
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onRefresh,
  } = options;

  const router = useRouter();
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);

      // Call custom callback if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Refresh the current route
      router.refresh();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [router, onRefresh, isRefreshing]);

  useEffect(() => {
    if (!enabled) return;

    // Set up interval for auto-refresh
    const intervalId = setInterval(refresh, interval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [enabled, interval, refresh]);

  return {
    refresh,
    lastRefreshTime,
    isRefreshing,
  };
}
