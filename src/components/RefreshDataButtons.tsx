'use client';

import { useState, useEffect } from 'react';
import { refreshBandData, refreshAlbumData, getRefreshStatus } from '@/app/actions/rock';

export default function RefreshDataButtons() {
  const [bandLoading, setBandLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [bandMessage, setBandMessage] = useState<string | null>(null);
  const [albumMessage, setAlbumMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<{ bandsWithoutCountry: number; albumsWithoutTracks: number } | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const data = await getRefreshStatus();
    setStatus(data);
  };

  const handleRefreshBands = async () => {
    setBandLoading(true);
    setBandMessage(null);

    const result = await refreshBandData();

    setBandLoading(false);
    setBandMessage(result.message);

    if (result.success) {
      await loadStatus();
    }

    setTimeout(() => setBandMessage(null), 5000);
  };

  const handleRefreshAlbums = async () => {
    setAlbumLoading(true);
    setAlbumMessage(null);

    const result = await refreshAlbumData();

    setAlbumLoading(false);
    setAlbumMessage(result.message);

    if (result.success) {
      await loadStatus();
    }

    setTimeout(() => setAlbumMessage(null), 5000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Band Data Refresh
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update band info from Spotify
            </p>
          </div>
        </div>

        {status && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Bands without country: <span className="font-bold text-amber-600">{status.bandsWithoutCountry}</span></p>
          </div>
        )}

        <button
          onClick={handleRefreshBands}
          disabled={bandLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold rounded-lg hover:from-red-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bandLoading ? 'Refreshing...' : 'Refresh Band Data (50 bands)'}
        </button>

        {bandMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            bandMessage.includes('success') || bandMessage.includes('completed')
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {bandMessage}
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Album Data Refresh
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add track lists to albums from Spotify
            </p>
          </div>
        </div>

        {status && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Albums without tracks: <span className="font-bold text-purple-600">{status.albumsWithoutTracks}</span></p>
          </div>
        )}

        <button
          onClick={handleRefreshAlbums}
          disabled={albumLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-purple-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {albumLoading ? 'Refreshing...' : 'Refresh Album Data'}
        </button>

        {albumMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            albumMessage.includes('success') || albumMessage.includes('completed')
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {albumMessage}
          </div>
        )}
      </div>
    </div>
  );
}
