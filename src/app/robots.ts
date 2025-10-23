/**
 * Robots.txt for METALDRAGON Rock Community
 * Controls search engine crawling behavior
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://metaldragon.co.kr/sitemap.xml',
  };
}
