/**
 * Concerts Page - METALDRAGON Rock Community
 * Shows both upcoming and past concerts with YouTube videos
 * Now includes Ticketmaster API integration
 */

import ConcertsClient from './ConcertsClient';
import prisma from '@/lib/prisma';
import { searchRockConcerts } from '@/lib/ticketmaster';

// ISR: 페이지를 60초마다 재생성
export const revalidate = 60;

export default async function ConcertsPage() {
  // 미래 콘서트 (upcoming) - Prisma (최신 50개만)
  const upcomingConcerts = await prisma.concert.findMany({
    where: {
      past_event: false,
    },
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
      date: 'asc',
    },
    take: 50,
  });

  // 과거 콘서트 (past) - Prisma (최신 50개만)
  const pastConcerts = await prisma.concert.findMany({
    where: {
      past_event: true,
    },
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
      date: 'desc',
    },
    take: 50,
  });

  // Ticketmaster 데이터 가져오기
  let ticketmasterEvents = [];
  try {
    // Ticketmaster API 날짜 형식: YYYY-MM-DDTHH:mm:ssZ (밀리초 제거)
    const startDateTime = new Date().toISOString().split('.')[0] + 'Z';
    const tmData = await searchRockConcerts({
      countryCode: 'US',
      startDateTime,
      size: 50,
    });
    ticketmasterEvents = tmData._embedded?.events || [];
    console.log(`✅ Fetched ${ticketmasterEvents.length} events from Ticketmaster`);
  } catch (error) {
    console.error('❌ Ticketmaster API error:', error);
    // Continue without Ticketmaster data
  }

  return (
    <ConcertsClient
      initialUpcoming={upcomingConcerts}
      initialPast={pastConcerts}
      ticketmasterEvents={ticketmasterEvents}
    />
  );
}
