/**
 * Providers Component
 * Wraps app with Emotion ThemeProvider, Dark Mode Theme Provider, and React Query
 */

'use client';

import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { theme } from '@/lib/styles/theme';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
