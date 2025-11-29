'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-client';

interface SpotifyBand {
  name: string;
  spotify_id: string;
  spotify_followers: number;
  spotify_popularity: number;
  genres: string[];
  image_url: string | null;
  logo_url: string | null;
}

interface SpotifyAlbum {
  title: string;
  release_year: number | null;
  cover_url: string | null;
  spotify_id: string;
  spotify_url: string | null;
  genres: string[];
  selected?: boolean;
}

interface Track {
  track_number: number;
  title: string;
  duration_seconds: number;
  spotify_id: string;
  preview_url: string | null;
}

export default function AddBandPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const [bandName, setBandName] = useState('');
  const [searchResult, setSearchResult] = useState<{
    band: SpotifyBand;
    albums: SpotifyAlbum[];
  } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser?.isAdmin) {
      alert('관리자만 접근 가능합니다.');
      router.push('/bands');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandName.trim()) return;

    setSearching(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await fetch(`/api/spotify/search-band?name=${encodeURIComponent(bandName)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search band');
      }

      // 모든 앨범을 기본적으로 선택
      const albumsWithSelection = data.albums.map((album: SpotifyAlbum) => ({
        ...album,
        selected: true,
      }));

      console.log(`📀 Total albums received: ${data.albums.length}`);
      console.log('Albums:', data.albums);

      setSearchResult({
        band: data.band,
        albums: albumsWithSelection,
      });
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search Spotify');
    } finally {
      setSearching(false);
    }
  };

  const toggleAlbum = (index: number) => {
    if (!searchResult) return;

    const updated = [...searchResult.albums];
    updated[index].selected = !updated[index].selected;
    setSearchResult({
      ...searchResult,
      albums: updated,
    });
  };

  const handleSave = async () => {
    if (!searchResult) return;

    setLoading(true);
    setError('');

    try {
      const selectedAlbums = searchResult.albums.filter((a) => a.selected);

      if (selectedAlbums.length === 0) {
        alert('적어도 하나의 앨범을 선택해주세요.');
        setLoading(false);
        return;
      }

      // 1. 먼저 밴드가 이미 존재하는지 확인
      const checkResponse = await fetch(`/api/bands?spotify_id=${searchResult.band.spotify_id}`);
      const checkData = await checkResponse.json();

      let createdBand;

      if (checkData.bands && checkData.bands.length > 0) {
        // 이미 존재하는 밴드 - 앨범만 추가
        createdBand = checkData.bands[0];
        const confirmAdd = confirm(
          `${searchResult.band.name} 밴드는 이미 등록되어 있습니다.\n\n선택한 앨범들을 추가하시겠습니까?\n\n"확인"을 누르면 새 앨범만 추가됩니다.\n"취소"를 누르면 밴드 페이지로 이동합니다.`
        );

        if (!confirmAdd) {
          router.push(`/bands/${createdBand.id}`);
          return;
        }

        console.log('✅ Existing band found, will add albums:', createdBand);
      }

      // 밴드가 없으면 새로 생성
      if (!createdBand) {
        const bandData = {
          name: searchResult.band.name,
          spotify_id: searchResult.band.spotify_id,
          spotify_followers: searchResult.band.spotify_followers,
          spotify_popularity: searchResult.band.spotify_popularity,
          genres: searchResult.band.genres,
          image_url: searchResult.band.image_url,
          logo_url: searchResult.band.logo_url,
        };

        const bandResponse = await fetch('/api/bands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bandData),
        });

        if (!bandResponse.ok) {
          const errorData = await bandResponse.json();
          console.error('Band creation error:', errorData);
          throw new Error(errorData.error || 'Failed to create band');
        }

        createdBand = await bandResponse.json();
        console.log('✅ Band created:', createdBand);
      }

      // 2. 선택한 앨범들과 트랙들 생성
      let addedAlbumsCount = 0;
      let skippedAlbumsCount = 0;

      for (const album of selectedAlbums) {
        // 앨범이 이미 존재하는지 확인 (spotify_id로)
        const existingAlbumCheck = await fetch(`/api/albums?band_id=${createdBand.id}&spotify_id=${album.spotify_id}`);
        const existingAlbumData = await existingAlbumCheck.json();

        if (existingAlbumData.albums && existingAlbumData.albums.length > 0) {
          console.log(`⏭️ Album already exists, skipping: ${album.title}`);
          skippedAlbumsCount++;
          continue;
        }

        // 앨범의 트랙 정보 가져오기
        const tracksResponse = await fetch(
          `/api/spotify/album-tracks?albumId=${album.spotify_id}`
        );
        const tracksData = await tracksResponse.json();

        if (!tracksData.success) {
          console.error('Failed to fetch tracks for album:', album.title);
          continue;
        }

        // YouTube URL 검색
        let youtubeUrl = null;
        try {
          const youtubeResponse = await fetch(
            `/api/youtube/search-album?band=${encodeURIComponent(searchResult.band.name)}&album=${encodeURIComponent(album.title)}`
          );
          const youtubeData = await youtubeResponse.json();
          if (youtubeData.success) {
            youtubeUrl = youtubeData.url;
            console.log(`🎥 YouTube URL found for ${album.title}:`, youtubeUrl);
          }
        } catch (err) {
          console.warn(`Failed to get YouTube URL for ${album.title}:`, err);
        }

        // 앨범 생성
        const albumData = {
          band_id: createdBand.id,
          title: album.title,
          release_year: album.release_year,
          cover_url: album.cover_url,
          genres: album.genres,
          spotify_id: album.spotify_id,
          spotify_url: album.spotify_url,
          youtube_url: youtubeUrl,
        };

        const albumResponse = await fetch('/api/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(albumData),
        });

        if (!albumResponse.ok) {
          console.error('Failed to create album:', album.title);
          continue;
        }

        const createdAlbum = await albumResponse.json();
        console.log('✅ Album created:', createdAlbum);
        addedAlbumsCount++;

        // 트랙 생성
        for (const track of tracksData.tracks) {
          const trackData = {
            album_id: createdAlbum.id,
            track_number: track.track_number,
            title: track.title,
            duration_seconds: track.duration_seconds,
            spotify_id: track.spotify_id,
            preview_url: track.preview_url,
          };

          await fetch('/api/tracks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackData),
          });
        }
      }

      let message = `${searchResult.band.name} 밴드: ${addedAlbumsCount}개의 앨범이 추가되었습니다!`;
      if (skippedAlbumsCount > 0) {
        message += `\n(${skippedAlbumsCount}개는 이미 존재하여 건너뛰었습니다)`;
      }
      alert(message);
      router.push(`/bands/${createdBand.id}`);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || '밴드 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎸</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/bands" className="text-red-600 hover:text-red-700 dark:text-red-400 mb-4 inline-block">
            ← Back to Bands
          </Link>
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Add New Band from Spotify</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            밴드명을 입력하면 Spotify에서 자동으로 정보를 가져옵니다
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex gap-4">
              <input
                type="text"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                placeholder="밴드명을 입력하세요 (예: Metallica)"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={searching}
              />
              <button
                type="submit"
                disabled={searching || !bandName.trim()}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {searching ? '검색 중...' : '🔍 Spotify 검색'}
              </button>
            </div>
          </div>
        </form>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* Band Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                밴드 정보
              </h2>
              <div className="flex gap-6">
                {searchResult.band.image_url && (
                  <img
                    src={searchResult.band.image_url}
                    alt={searchResult.band.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {searchResult.band.name}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Followers: {searchResult.band.spotify_followers.toLocaleString()}</p>
                    <p>Popularity: {searchResult.band.spotify_popularity}/100</p>
                    {searchResult.band.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {searchResult.band.genres.map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Albums Selection */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                앨범 선택 ({searchResult.albums.filter((a) => a.selected).length}/{searchResult.albums.length})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                추가할 앨범을 선택하세요. 모든 트랙 정보가 자동으로 포함됩니다.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResult.albums.map((album, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleAlbum(idx)}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      album.selected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {album.cover_url && (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full aspect-square rounded object-cover mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {album.title}
                    </h4>
                    {album.release_year && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{album.release_year}</p>
                    )}
                    {album.selected && (
                      <div className="mt-2 text-center">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">✓ 선택됨</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || searchResult.albums.filter((a) => a.selected).length === 0}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '✅ 밴드 및 앨범 추가하기'}
              </button>
              <button
                onClick={() => setSearchResult(null)}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold rounded-lg transition-all"
              >
                다시 검색
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
