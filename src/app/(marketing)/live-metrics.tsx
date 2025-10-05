/**
 * Live Metrics Component - Tailwind CSS
 * Streams real-time data from Supabase
 */

import { createClient } from '@/lib/supabase/server';

export async function LiveMetrics() {
  const supabase = await createClient();

  // Fetch live metrics from Supabase
  const [
    { count: postCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="flex gap-6 justify-center flex-wrap mt-6">
      <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-6 py-4 min-w-[150px] text-center shadow-lg text-white">
        <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          {postCount ?? 0}
        </div>
        <div className="text-sm text-white/80 mt-1">게시물</div>
      </div>

      <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-6 py-4 min-w-[150px] text-center shadow-lg text-white">
        <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          {userCount ?? 0}
        </div>
        <div className="text-sm text-white/80 mt-1">사용자</div>
      </div>

      <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-6 py-4 min-w-[150px] text-center shadow-lg text-white">
        <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          <time suppressHydrationWarning className="text-xs text-white/60 font-mono">
            {new Date().toLocaleTimeString('ko-KR')}
          </time>
        </div>
        <div className="text-sm text-white/80 mt-1">실시간 업데이트</div>
      </div>
    </div>
  );
}

// Skeleton for streaming
export function LiveMetricsSkeleton() {
  return (
    <div className="flex gap-6 justify-center flex-wrap mt-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-6 py-4 min-w-[150px] text-center shadow-lg text-white opacity-50"
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
            --
          </div>
          <div className="text-sm text-white/80 mt-1">Loading...</div>
        </div>
      ))}
    </div>
  );
}
