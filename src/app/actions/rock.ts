/**
 * Server Actions for Rock Community
 * Admin actions for band and album management
 */

'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

/**
 * Refresh band data from Spotify
 * Executes the search-and-update-bands.js script
 */
export async function refreshBandData() {
  try {
    const { stdout, stderr } = await execAsync(
      'node scripts/search-and-update-bands.js',
      {
        cwd: process.cwd(),
        timeout: 120000, // 2 minutes
      }
    );

    // Revalidate paths
    revalidatePath('/bands');
    revalidatePath('/bands/countries');
    revalidatePath('/albums');

    return {
      success: true,
      message: 'Band data refresh completed successfully',
      output: stdout,
    };
  } catch (error: any) {
    console.error('Error refreshing band data:', error);
    return {
      success: false,
      message: error.message || 'Failed to refresh band data',
      output: error.stderr || error.stdout || '',
    };
  }
}

/**
 * Refresh album data from Spotify
 * Executes the add-album-tracks.js script for albums without tracks
 */
export async function refreshAlbumData() {
  try {
    const { stdout, stderr } = await execAsync(
      'node scripts/add-album-tracks.js',
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes
      }
    );

    // Revalidate paths
    revalidatePath('/albums');
    revalidatePath('/albums/korean');

    return {
      success: true,
      message: 'Album data refresh completed successfully',
      output: stdout,
    };
  } catch (error: any) {
    console.error('Error refreshing album data:', error);
    return {
      success: false,
      message: error.message || 'Failed to refresh album data',
      output: error.stderr || error.stdout || '',
    };
  }
}

/**
 * Get refresh status
 * Returns statistics about data freshness
 */
export async function getRefreshStatus() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Count bands without country
    const { count: bandsWithoutCountry } = await supabase
      .from('bands')
      .select('*', { count: 'exact', head: true })
      .is('country', null);

    // Get all album IDs
    const { data: albums } = await supabase
      .from('albums')
      .select('id');

    // Get album IDs that have tracks
    const { data: albumsWithTracks } = await supabase
      .from('tracks')
      .select('album_id')
      .not('album_id', 'is', null);

    const albumsWithTracksIds = new Set(
      albumsWithTracks?.map((t) => t.album_id) || []
    );

    const albumsWithoutTracksCount = albums?.filter(
      (a) => !albumsWithTracksIds.has(a.id)
    ).length || 0;

    return {
      bandsWithoutCountry: bandsWithoutCountry || 0,
      albumsWithoutTracks: albumsWithoutTracksCount,
    };
  } catch (error) {
    console.error('Error getting refresh status:', error);
    return {
      bandsWithoutCountry: 0,
      albumsWithoutTracks: 0,
    };
  }
}
