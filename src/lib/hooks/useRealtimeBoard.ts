/**
 * Realtime Board Hook
 * Based on HELP_GPT/code_snippets.md
 * Subscribes to postgres_changes with acknowledgement
 */

'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeBoard(boardId: string, onChange: () => void) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`postgres_changes:posts:id=eq.${boardId}`, { config: { ack: true } })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `category_id=eq.${boardId}`,
        },
        onChange
      )
      .subscribe((status) => {
        if (status === 'TIMED_OUT') {
          console.error('[Realtime] Channel timed out, unsubscribing...');
          channel.unsubscribe();
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [boardId, onChange]);
}
