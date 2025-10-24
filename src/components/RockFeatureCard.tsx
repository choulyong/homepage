/**
 * Rock Feature Card Component
 * 완전히 새로운 컴포넌트 - HMR 캐시 문제 해결
 */

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface RockFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export default function RockFeatureCard({ title, description, icon, link }: RockFeatureCardProps) {
  return (
    <Link href={link} className="block h-full">
      <Card hoverable className="h-full bg-gradient-to-br from-amber-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 border-2 transition-all duration-300">
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
    </Link>
  );
}
