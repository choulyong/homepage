/**
 * Ticketmaster API Integration
 * https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY;

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  sales?: {
    public?: {
      startDateTime: string;
      endDateTime: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
    };
    timezone?: string;
    status?: {
      code: string;
    };
  };
  classifications?: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
  }>;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state?: {
        name: string;
        stateCode: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      location?: {
        longitude: string;
        latitude: string;
      };
    }>;
    attractions?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      images?: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    }>;
  };
}

export interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

/**
 * Search for Rock/Metal concerts
 */
export async function searchRockConcerts(params: {
  keyword?: string;
  city?: string;
  countryCode?: string;
  startDateTime?: string;
  endDateTime?: string;
  size?: number;
  page?: number;
} = {}): Promise<TicketmasterResponse> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key not configured');
  }

  const queryParams = new URLSearchParams({
    apikey: API_KEY,
    classificationName: 'Music', // Music events
    genreId: 'KnvZfZ7vAe1', // Rock genre ID
    sort: 'date,asc', // Sort by date ascending
    size: String(params.size || 20),
    page: String(params.page || 0),
  });

  if (params.keyword) {
    queryParams.append('keyword', params.keyword);
  }

  if (params.city) {
    queryParams.append('city', params.city);
  }

  if (params.countryCode) {
    queryParams.append('countryCode', params.countryCode);
  }

  if (params.startDateTime) {
    queryParams.append('startDateTime', params.startDateTime);
  }

  if (params.endDateTime) {
    queryParams.append('endDateTime', params.endDateTime);
  }

  const url = `${TICKETMASTER_API_BASE}/events.json?${queryParams.toString()}`;

  console.log('🎫 Fetching from Ticketmaster:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: {
      revalidate: 3600, // Cache for 1 hour
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Ticketmaster API error:', error);
    throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get event details by ID
 */
export async function getEventDetails(eventId: string): Promise<TicketmasterEvent> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key not configured');
  }

  const url = `${TICKETMASTER_API_BASE}/events/${eventId}.json?apikey=${API_KEY}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Search for specific artist/band
 */
export async function searchArtistEvents(artistName: string, params: {
  size?: number;
  page?: number;
} = {}): Promise<TicketmasterResponse> {
  return searchRockConcerts({
    keyword: artistName,
    size: params.size,
    page: params.page,
  });
}
