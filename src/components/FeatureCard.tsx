/**
 * Feature Card Component
 * Rock Community 기능 카드 - v2
 */

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export default function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
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

// Named export for backward compatibility
export { FeatureCard };
