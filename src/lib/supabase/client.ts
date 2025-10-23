/**
 * Supabase Client for Client Components
 * Supports Realtime subscriptions with acknowledgement
 * Based on HELP_GPT/realtime_and_automation.md
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ✅ 쿠키 설정으로 세션 자동 갱신
      cookies: {
        getAll() {
          if (typeof document === 'undefined') {
            return [];
          }

          const cookieList = [];
          const cookies = document.cookie.split(';');

          for (let cookie of cookies) {
            const [name, ...rest] = cookie.trim().split('=');
            cookieList.push({
              name,
              value: decodeURIComponent(rest.join('=')),
            });
          }

          return cookieList;
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') {
            return;
          }

          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${encodeURIComponent(value)}`;

            if (options?.maxAge) {
              const expires = new Date();
              expires.setSeconds(expires.getSeconds() + options.maxAge);
              document.cookie = `${cookieString};expires=${expires.toUTCString()};path=/`;
            } else if (options?.expires) {
              document.cookie = `${cookieString};expires=${options.expires.toUTCString()};path=/`;
            } else {
              document.cookie = `${cookieString};path=/`;
            }
          });
        },
      },
    }
  );
}
