/**
 * Albums Page - METALDRAGON Rock Community
 * With sorting and country filtering
 */

import prisma from '@/lib/prisma';
import AlbumsClient from './AlbumsClient';

// ISR: 페이지를 60초마다 재생성
export const revalidate = 60;

export default async function AlbumsPage() {
  // 전체 앨범 수 조회
  const totalAlbums = await prisma.album.count();

  // 첫 페이지만 로드 (500개)
  const albums = await prisma.album.findMany({
    take: 500,
    include: {
      band: {
        select: {
          id: true,
          name: true,
          country: true,
          image_url: true,
        },
      },
    },
    orderBy: {
      release_year: 'desc',
    },
  });

  // Get unique countries (전체 데이터에서)
  const allCountries = await prisma.band.findMany({
    where: {
      country: {
        not: null,
      },
    },
    select: {
      country: true,
    },
    distinct: ['country'],
  });

  const countries = allCountries
    .map(b => b.country)
    .filter(Boolean)
    .sort() as string[];

  console.log(`📊 Total albums: ${totalAlbums}, Loaded: ${albums.length}`);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">💿 Album Reviews</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            명반들에 대한 리뷰를 읽고 당신만의 평가를 남기세요
          </p>
        </div>

        <AlbumsClient
          initialAlbums={albums || []}
          countries={countries}
          totalCount={totalAlbums}
        />
      </div>
    </div>
  );
}
