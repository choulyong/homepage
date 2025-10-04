/**
 * Robots.txt Generation
 * 검색 엔진 크롤러 설정
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://metaldragon.co.kr/sitemap.xml',
  };
}
