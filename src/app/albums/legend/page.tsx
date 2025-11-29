/**
 * Legend Korean Music Albums Page - 한국 대중음악 명반 100
 * 2018년 멜론/한겨레/태림스코어 선정
 * Server Component
 */

import prisma from '@/lib/prisma';
import LegendAlbumsClient from './LegendAlbumsClient';

export const metadata = {
  title: '한국 대중음악 명반 100 | METALDRAGON',
  description: '2018년 멜론/한겨레/태림스코어 선정 한국 대중음악 명반 100 - 유재하, 들국화, 서태지와아이들, 시나위, 부활 등',
};

// ISR: 페이지를 60초마다 재생성
export const revalidate = 60;

export default async function LegendKoreanMusicPage() {
  // 한국 대중음악 명반 100 (2018년 멜론/한겨레/태림스코어 선정)
  // is_legend = true인 앨범만 표시
  const legendAlbums = await prisma.album.findMany({
    where: {
      is_legend: true, // 명반 100에 포함된 앨범만
      band: {
        country: 'South Korea'
      }
    },
    select: {
      id: true,
      title: true,
      cover_url: true,
      release_year: true,
      youtube_url: true,
      spotify_id: true,
      legend_rank: true, // 명반 순위 포함
      band: {
        select: {
          id: true,
          name: true,
          country: true,
          logo_url: true,
          image_url: true,
          spotify_followers: true,
          genres: true,
        },
      },
      tracks: {
        select: {
          id: true,
          title: true,
          track_number: true,
          duration_seconds: true,
          youtube_url: true,
        },
        orderBy: {
          track_number: 'asc'
        }
      }
    },
    orderBy: {
      legend_rank: 'asc' // 명반 순위순 (1위부터)
    }
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              <span className="gradient-text">🏆 한국 대중음악 명반 100</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              2018년 멜론/한겨레/태림스코어 선정
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              유재하, 들국화, 서태지와아이들, 시나위, 부활, 김광석 등 전설의 명반들
            </p>
          </div>
        </div>

        <LegendAlbumsClient albums={legendAlbums} />
      </div>
    </div>
  );
}
