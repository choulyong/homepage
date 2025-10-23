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
import { PageBackground } from '@/components/PageBackground';

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
  title: 'METALDRAGON - Rock Community | 전 세계 Rock 음악 커뮤니티',
  description: '전 세계 Rock 밴드, 앨범, 콘서트 정보와 팬들의 커뮤니티. Classic Rock, Heavy Metal, Punk Rock, Alternative Rock 등 모든 Rock 장르를 탐험하세요.',
  keywords: ['Rock', 'Heavy Metal', 'Rock Music', 'Rock Band', 'Album Review', 'Concert', 'Rock Community', 'Classic Rock', 'Metal', 'Punk Rock', '록', '록 음악', '헤비메탈', '밴드'],
  authors: [{ name: 'METALDRAGON' }],
  openGraph: {
    title: 'METALDRAGON - Rock Community',
    description: '전 세계 Rock 밴드, 앨범, 콘서트 정보와 팬들의 커뮤니티',
    url: 'https://metaldragon.co.kr',
    siteName: 'METALDRAGON',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://metaldragon.co.kr/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'METALDRAGON Rock Community',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METALDRAGON - Rock Community',
    description: '전 세계 Rock 밴드, 앨범, 콘서트 정보와 팬들의 커뮤니티',
    images: ['https://metaldragon.co.kr/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} ${redHatDisplay.variable}`} suppressHydrationWarning>
        <Providers>
          <AnalyticsTracker />
          <PageBackground />
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
