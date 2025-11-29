/**
 * Genre filtering utilities for rock/metal bands
 * Used to exclude non-rock/metal artists from band listings
 */

// 제외할 장르 키워드 (소문자)
const EXCLUDE_GENRES = [
  'hip hop', 'rap', 'r&b', 'rnb', 'soul', 'funk',
  'pop', 'dance pop', 'k-pop', 'j-pop',
  'edm', 'electronic', 'house', 'techno', 'trance',
  'reggae', 'ska', 'dub',
  'country', 'folk', 'bluegrass',
  'jazz', 'blues',
  'classical', 'opera',
  'gospel', 'christian'
];

// 허용할 장르 키워드 (rock/metal 관련)
const ALLOW_GENRES = [
  'rock', 'metal', 'punk', 'grunge', 'alternative',
  'indie', 'hardcore', 'emo', 'post', 'prog',
  'psychedelic', 'blues rock', 'hard rock', 'soft rock',
  'glam', 'gothic', 'industrial', 'nu metal', 'metalcore'
];

/**
 * Prisma where clause for filtering rock/metal bands by genre
 * Usage: prisma.band.findMany({ where: getRockMetalGenreFilter() })
 */
export function getRockMetalGenreFilter() {
  return {
    OR: [
      // Has at least one allowed genre
      ...ALLOW_GENRES.map(genre => ({
        genres: {
          hasSome: [genre]
        }
      })),
      // Allow bands with unknown/empty genres (conservative filtering)
      {
        OR: [
          { genres: { equals: null } },
          { genres: { isEmpty: true } }
        ]
      }
    ],
    // Exclude bands with only excluded genres
    NOT: {
      AND: EXCLUDE_GENRES.map(genre => ({
        genres: {
          hasSome: [genre]
        }
      }))
    }
  };
}

/**
 * Client-side genre filtering for band arrays
 * Use this when you need to filter bands after fetching from DB
 */
export function isRockMetalBand(genres: string[] | null): boolean {
  // FIX: Exclude artists with no genre info (like Beyoncé with empty array)
  // Empty genres are usually non-rock artists that Spotify doesn't classify
  if (!genres || genres.length === 0) return false;

  const genresLower = genres.map(g => g.toLowerCase());

  // 1. Has allowed genre? Keep it
  const hasAllowedGenre = genresLower.some(genre =>
    ALLOW_GENRES.some(allowed => genre.includes(allowed))
  );

  if (hasAllowedGenre) return true;

  // 2. Has excluded genre? Remove it
  const hasExcludedGenre = genresLower.some(genre =>
    EXCLUDE_GENRES.some(excluded => genre.includes(excluded))
  );

  if (hasExcludedGenre) return false;

  // 3. Ambiguous case - exclude to be safe (strict filtering)
  return false;
}
