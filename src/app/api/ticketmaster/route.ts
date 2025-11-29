import { NextRequest, NextResponse } from 'next/server';
import { searchRockConcerts, searchArtistEvents } from '@/lib/ticketmaster';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get('artist');
    const city = searchParams.get('city');
    const countryCode = searchParams.get('countryCode') || 'US';
    const size = parseInt(searchParams.get('size') || '20');
    const page = parseInt(searchParams.get('page') || '0');

    // Get upcoming events (from today) - Ticketmaster format: YYYY-MM-DDTHH:mm:ssZ
    const startDateTime = new Date().toISOString().split('.')[0] + 'Z';

    let data;
    if (artist) {
      // Search for specific artist
      data = await searchArtistEvents(artist, { size, page });
    } else {
      // Search for all rock concerts
      data = await searchRockConcerts({
        city,
        countryCode,
        startDateTime,
        size,
        page,
      });
    }

    const events = data._embedded?.events || [];

    return NextResponse.json({
      success: true,
      events,
      page: data.page,
    });
  } catch (error: any) {
    console.error('Ticketmaster API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch concerts',
      },
      { status: 500 }
    );
  }
}
