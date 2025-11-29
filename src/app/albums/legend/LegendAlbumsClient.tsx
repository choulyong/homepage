'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { cn } from '@/lib/utils';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';

interface Track {
  id: string;
  title: string;
  track_number: number | null;
  duration_seconds: number | null;
  youtube_url: string | null;
}

interface Band {
  id: string;
  name: string;
  country: string | null;
  logo_url: string | null;
  image_url: string | null;
  spotify_followers: number;
  genres: string[] | null;
}

interface Album {
  id: string;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  youtube_url: string | null;
  spotify_id: string | null;
  legend_rank: number | null;
  band: Band | null;
  tracks: Track[];
}

interface Props {
  albums: Album[];
}

export default function LegendAlbumsClient({ albums }: Props) {
  const router = useRouter();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState('');

  // Auto-refresh every 60 seconds
  const { lastRefreshTime, isRefreshing } = useAutoRefresh({
    interval: 60000, // 1분마다 자동 새로고침
    enabled: true,
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      router.refresh();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  const openModal = (album: Album) => {
    setSelectedAlbum(album);
    setEditedUrl(album.youtube_url || '');
    setIsEditingUrl(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditingUrl(false);
    setTimeout(() => setSelectedAlbum(null), 300);
  };

  const handleUpdateYouTubeUrl = async () => {
    if (!selectedAlbum) return;

    try {
      const response = await fetch(`/api/albums/${selectedAlbum.id}/update-youtube`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_url: editedUrl }),
      });

      if (response.ok) {
        // Update local state
        setSelectedAlbum({
          ...selectedAlbum,
          youtube_url: editedUrl,
        });
        setIsEditingUrl(false);
        // Refresh the page data
        router.refresh();
        alert('YouTube URL이 업데이트되었습니다!');
      } else {
        alert('업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  return (
    <>
      {/* Header with Refresh Button */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          {/* Auto-refresh status */}
          {mounted && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isRefreshing ? "bg-green-400" : "bg-blue-400"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isRefreshing ? "bg-green-500" : "bg-blue-500"
                )}></span>
              </span>
              {isRefreshing ? '업데이트 중...' : `마지막 업데이트: ${lastRefreshTime.toLocaleTimeString('ko-KR')}`}
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]',
            refreshing
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 touch-manipulation'
          )}
          aria-label="새로고침"
        >
          <svg
            className={cn('w-5 h-5', refreshing && 'animate-spin')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">
            {refreshing ? '새로고침 중...' : '새로고침'}
          </span>
        </button>
      </div>

      {/* Albums Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎵 명반 컬렉션
          </h2>
          <span className="text-sm text-gray-500">
            {albums.length}개의 명반
          </span>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.map((album, index) => (
              <button
                key={album.id}
                onClick={() => openModal(album)}
                className="group bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-zinc-800 hover:scale-105 cursor-pointer"
              >
                {/* Legend Ranking Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                    #{album.legend_rank || index + 1}위
                  </div>
                </div>

                {/* Album Cover */}
                <div className="aspect-square bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center overflow-hidden">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-6xl">💿</span>
                  )}
                </div>

                {/* Album Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1 group-hover:text-red-500 transition-colors line-clamp-2">
                    {album.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                    {album.band?.name || 'Unknown Band'}
                  </p>
                  {album.release_year && (
                    <p className="text-xs text-gray-500 font-semibold">
                      {album.release_year}
                    </p>
                  )}
                  {album.tracks.length > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {album.tracks.length} tracks
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
            <div className="text-6xl mb-4">🎸</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Legend Albums Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              레전드 앨범이 없습니다
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedAlbum && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white">
              <div className="flex items-start gap-6">
                {/* Album Cover */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg overflow-hidden shadow-xl">
                    {selectedAlbum.cover_url ? (
                      <img
                        src={selectedAlbum.cover_url}
                        alt={selectedAlbum.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-5xl">💿</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Album Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-display font-bold mb-2">
                    {selectedAlbum.title}
                  </h2>
                  <p className="text-xl font-semibold mb-2 opacity-90">
                    {selectedAlbum.band?.name}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {selectedAlbum.release_year && (
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        📅 {selectedAlbum.release_year}
                      </span>
                    )}
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      🎵 {selectedAlbum.tracks.length} tracks
                    </span>
                    {selectedAlbum.band?.spotify_followers && (
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        👥 {selectedAlbum.band.spotify_followers.toLocaleString()} followers
                      </span>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* YouTube Video Section */}
            <div className="px-6 pt-6" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📺 Album Video
                </h3>
                {!isEditingUrl ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingUrl(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    ✏️ Edit URL
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateYouTubeUrl();
                      }}
                      className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingUrl(false);
                        setEditedUrl(selectedAlbum.youtube_url || '');
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditingUrl ? (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500">
                    YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=KdReaqbHIeg)
                  </p>
                </div>
              ) : selectedAlbum.youtube_url && getYouTubeVideoId(selectedAlbum.youtube_url) ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedAlbum.youtube_url)}`}
                    title="Album Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">YouTube URL이 없습니다</p>
                  <button
                    onClick={() => setIsEditingUrl(true)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    URL 추가하기
                  </button>
                </div>
              )}
            </div>

            {/* Spotify Player Section */}
            {selectedAlbum.spotify_id && (
              <div className="px-6 pb-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  🎵 Spotify Player
                </h3>
                <SpotifyPlayer
                  spotifyId={selectedAlbum.spotify_id}
                  albumTitle={selectedAlbum.title}
                  artistName={selectedAlbum.band?.name || 'Unknown Artist'}
                />
              </div>
            )}

            {/* Track List */}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                🎧 Track List
              </h3>

              {selectedAlbum.tracks.length > 0 ? (
                <div className="space-y-2">
                  {selectedAlbum.tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-sm w-8 text-center">
                        {track.track_number || '-'}
                      </span>
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">
                        {track.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                        {formatDuration(track.duration_seconds)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>트랙 정보가 없습니다</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <Link
                  href={`/albums/${selectedAlbum.id}`}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-lg shadow-md transition-all text-center"
                >
                  앨범 상세보기
                </Link>
                {selectedAlbum.band && (
                  <Link
                    href={`/bands/${selectedAlbum.band.id}`}
                    className="flex-1 px-6 py-3 border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-bold rounded-lg transition-all text-center"
                  >
                    밴드 보기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
