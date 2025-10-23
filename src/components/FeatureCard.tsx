/**
 * Feature Card Component
 * 각 페이지의 배경 이미지를 카드 배경으로 표시
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getPageBackground, type PageBackground } from '@/app/actions/backgrounds';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  const [background, setBackground] = useState<PageBackground | null>(null);

  useEffect(() => {
    const loadBackground = async () => {
      const result = await getPageBackground(link);
      if (result.success && result.background) {
        setBackground(result.background);
      }
    };

    loadBackground();
  }, [link]);

  return (
    <Link href={link}>
      <div className="relative h-full overflow-hidden rounded-lg group">
        {/* 배경색 레이어 */}
        {background?.background_color && (
          <div
            className="absolute inset-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: background.background_color,
            }}
          />
        )}

        {/* 배경 이미지 레이어 */}
        {background?.background_url && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundImage: `url(${background.background_url})`,
              opacity: background.opacity || 0.3,
            }}
          />
        )}

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-sm" />

        {/* 카드 콘텐츠 */}
        <Card hoverable className="h-full relative bg-transparent border-2">
          <CardHeader>
            <div className="text-4xl mb-3">{icon}</div>
            <CardTitle className="text-gray-900 dark:text-white">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
