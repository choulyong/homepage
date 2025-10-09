/**
 * Root Layout with Emotion Theme Provider
 * Based on metaldragon design system
 */

import type { Metadata } from 'next';
import { Inter, Red_Hat_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'metaldragon - 현대적인 개인 포털',
  description: '실시간 학습, 재무 관리, AI 창작물을 하나의 운영 패널에서',
  keywords: ['AI', '스터디', '가계부', 'IT 뉴스', 'AI 작품', '개인 포털'],
  authors: [{ name: 'metaldragon' }],
  openGraph: {
    title: 'metaldragon - 현대적인 개인 포털',
    description: '실시간 학습, 재무 관리, AI 창작물을 하나의 운영 패널에서',
    url: 'https://metaldragon.co.kr',
    siteName: 'metaldragon',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${redHatDisplay.variable}`}>
        <Providers>
          <AnalyticsTracker />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
