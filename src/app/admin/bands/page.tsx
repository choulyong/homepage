/**
 * Admin Bands Management Page
 * Manage bands and their albums
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';

interface Band {
  id: string;
  name: string;
  country: string;
  formed_year: number | null;
  genres: string[];
  origin: string | null;
  bio: string | null;
}

interface Album {
  id: string;
  band_id: string;
  title: string;
  release_year: number | null;
  genres: string[];
  band?: {
    name: string;
  };
}

export default function AdminBandsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bands, setBands] = useState<Band[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showBandForm, setShowBandForm] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [selectedBand, setSelectedBand] = useState<string | null>(null);

  // Band form state
  const [bandForm, setBandForm] = useState({
    name: '',
    country: '',
    formed_year: '',
    genres: '',
    origin: '',
    bio: '',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      website: '',
    },
  });

  // Image upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [albumCoverFile, setAlbumCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Spotify fetch states
  const [fetchingSpotify, setFetchingSpotify] = useState(false);
  const [spotifyAlbums, setSpotifyAlbums] = useState<any[]>([]);

  // Album form state
  const [albumForm, setAlbumForm] = useState({
    band_id: '',
    title: '',
    release_year: '',
    genres: '',
    label: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // localStorage 기반 인증 확인
      const userData = getCurrentUser();

      if (!userData) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      // Check if admin
      if (!userData.isAdmin) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }

      console.log('✅ Admin authenticated:', userData.email || userData.username);
      setUser(userData);
      loadBands();
      loadAlbums();
      setLoading(false);
    } catch (err) {
      console.error('❌ Auth error:', err);
      router.push('/auth/login');
    }
  };

  const loadBands = async () => {
    try {
      const response = await fetch('/api/bands?limit=100');
      const data = await response.json();
      if (data.bands) {
        setBands(data.bands);
      }
    } catch (err) {
      console.error('Error loading bands:', err);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      const data = await response.json();
      if (data.success && data.albums) {
        setAlbums(data.albums);
      }
    } catch (err) {
      console.error('Error loading albums:', err);
    }
  };

  const fetchFromSpotify = async () => {
    if (!bandForm.name.trim()) {
      alert('밴드 이름을 먼저 입력해주세요.');
      return;
    }

    setFetchingSpotify(true);
    try {
      const response = await fetch(`/api/spotify/search-band?name=${encodeURIComponent(bandForm.name)}`);
      const data = await response.json();

      if (!data.success) {
        alert(data.error || 'Spotify에서 밴드를 찾을 수 없습니다.');
        return;
      }

      // Auto-fill band form with Spotify data
      setBandForm({
        ...bandForm,
        name: data.band.name,
        genres: data.band.genres.join(', '),
        bio: `${data.band.name} is a band with ${data.band.spotify_followers.toLocaleString()} followers on Spotify.`,
      });

      // Store albums for later
      setSpotifyAlbums(data.albums);

      alert(`✅ Spotify에서 ${data.band.name} 정보를 가져왔습니다!\n앨범 ${data.total_albums}개가 준비되었습니다.`);
    } catch (err) {
      console.error('Spotify fetch error:', err);
      alert('Spotify 검색 실패');
    } finally {
      setFetchingSpotify(false);
    }
  };

  const handleBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let logo_url = null;
      let image_url = null;

      // Upload logo if provided
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('bucket', 'band-logos');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          logo_url = uploadData.url;
        }
      }

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('bucket', 'band-images');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          image_url = uploadData.url;
        }
      }

      // Create band
      const response = await fetch('/api/bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bandForm.name,
          country: bandForm.country,
          formed_year: bandForm.formed_year ? parseInt(bandForm.formed_year) : null,
          genres: bandForm.genres.split(',').map(g => g.trim()).filter(Boolean),
          origin: bandForm.origin || null,
          bio: bandForm.bio || null,
          social_links: bandForm.social_links,
          logo_url,
          image_url,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const bandId = data.id;

        // If we have Spotify albums, add them automatically
        if (spotifyAlbums.length > 0) {
          let addedCount = 0;
          for (const album of spotifyAlbums) {
            try {
              const albumResponse = await fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  band_id: bandId,
                  title: album.title,
                  release_year: album.release_year,
                  genres: album.genres,
                  cover_url: album.cover_url,
                  spotify_id: album.spotify_id,
                  spotify_url: album.spotify_url,
                }),
              });

              if (albumResponse.ok) {
                addedCount++;
              }
            } catch (err) {
              console.error('Error adding album:', err);
            }
          }

          alert(`✅ ${bandForm.name} 밴드가 추가되었습니다!\n앨범 ${addedCount}개도 함께 추가되었습니다.`);
        } else {
          alert(`${bandForm.name} 밴드가 추가되었습니다!`);
        }

        setShowBandForm(false);
        setBandForm({
          name: '',
          country: '',
          formed_year: '',
          genres: '',
          origin: '',
          bio: '',
          social_links: { facebook: '', instagram: '', twitter: '', youtube: '', website: '' },
        });
        setLogoFile(null);
        setImageFile(null);
        setSpotifyAlbums([]);
        loadBands();
        loadAlbums();
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error adding band:', err);
      alert('밴드 추가 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let cover_url = null;

      // Upload album cover if provided
      if (albumCoverFile) {
        const formData = new FormData();
        formData.append('file', albumCoverFile);
        formData.append('bucket', 'album-covers');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          cover_url = uploadData.url;
        }
      }

      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          band_id: albumForm.band_id,
          title: albumForm.title,
          release_year: albumForm.release_year ? parseInt(albumForm.release_year) : null,
          genres: albumForm.genres.split(',').map(g => g.trim()).filter(Boolean),
          label: albumForm.label || null,
          cover_url,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`${albumForm.title} 앨범이 추가되었습니다!`);
        setShowAlbumForm(false);
        setAlbumForm({ band_id: '', title: '', release_year: '', genres: '', label: '' });
        setAlbumCoverFile(null);
        loadAlbums();
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error adding album:', err);
      alert('앨범 추가 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBand = async (id: string, name: string) => {
    if (!confirm(`${name} 밴드를 삭제하시겠습니까? (모든 앨범도 함께 삭제됩니다)`)) return;

    try {
      const response = await fetch(`/api/bands/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        alert('밴드가 삭제되었습니다.');
        loadBands();
        loadAlbums();
      } else {
        alert(`삭제 실패: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting band:', err);
      alert('밴드 삭제 실패');
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!confirm(`${title} 앨범을 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/albums?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        alert('앨범이 삭제되었습니다.');
        loadAlbums();
      } else {
        alert(`삭제 실패: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting album:', err);
      alert('앨범 삭제 실패');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  const filteredAlbums = selectedBand
    ? albums.filter(a => a.band_id === selectedBand)
    : albums;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          🎸 밴드 & 앨범 관리
        </h1>

        {/* Band Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">밴드 목록 ({bands.length})</h2>
            <button
              onClick={() => setShowBandForm(!showBandForm)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium"
            >
              {showBandForm ? '취소' : '+ 밴드 추가'}
            </button>
          </div>

          {/* Band Form */}
          {showBandForm && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">새 밴드 추가</h3>
              <form onSubmit={handleBandSubmit} className="space-y-4">
                {/* Band Name + Spotify Fetch Button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="밴드 이름 입력 *"
                    value={bandForm.name}
                    onChange={(e) => setBandForm({ ...bandForm, name: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                    required
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    onClick={fetchFromSpotify}
                    disabled={fetchingSpotify || uploading || !bandForm.name.trim()}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {fetchingSpotify ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        가져오는 중...
                      </>
                    ) : (
                      <>
                        🎵 Spotify에서 가져오기
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="국가 (예: USA, Finland, Korea) *"
                    value={bandForm.country}
                    onChange={(e) => setBandForm({ ...bandForm, country: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="결성년도 (예: 1986)"
                    value={bandForm.formed_year}
                    onChange={(e) => setBandForm({ ...bandForm, formed_year: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="장르 (쉼표로 구분: Heavy Metal, Power Metal)"
                    value={bandForm.genres}
                    onChange={(e) => setBandForm({ ...bandForm, genres: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="출신 (예: Helsinki, Finland)"
                  value={bandForm.origin}
                  onChange={(e) => setBandForm({ ...bandForm, origin: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="밴드 소개"
                  value={bandForm.bio}
                  onChange={(e) => setBandForm({ ...bandForm, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  rows={3}
                />
                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      밴드 로고 이미지
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100
                        dark:file:bg-red-900/20 dark:file:text-red-400"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      밴드 메인 이미지
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-amber-50 file:text-amber-700
                        hover:file:bg-amber-100
                        dark:file:bg-amber-900/20 dark:file:text-amber-400"
                      disabled={uploading}
                    />
                  </div>
                </div>
                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={bandForm.social_links.facebook}
                    onChange={(e) => setBandForm({ ...bandForm, social_links: { ...bandForm.social_links, facebook: e.target.value } })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={bandForm.social_links.instagram}
                    onChange={(e) => setBandForm({ ...bandForm, social_links: { ...bandForm.social_links, instagram: e.target.value } })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder="YouTube URL"
                    value={bandForm.social_links.youtube}
                    onChange={(e) => setBandForm({ ...bandForm, social_links: { ...bandForm.social_links, youtube: e.target.value } })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={bandForm.social_links.website}
                    onChange={(e) => setBandForm({ ...bandForm, social_links: { ...bandForm.social_links, website: e.target.value } })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-lg shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '밴드 추가'}
                </button>
              </form>
            </div>
          )}

          {/* Band List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bands.map((band) => (
              <div key={band.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-4 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{band.name}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>🌍 {band.country} {band.origin && `(${band.origin})`}</p>
                  {band.formed_year && <p>📅 {band.formed_year}</p>}
                  {band.genres.length > 0 && <p>🎵 {band.genres.join(', ')}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedBand(selectedBand === band.id ? null : band.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    {selectedBand === band.id ? '앨범 숨기기' : '앨범 보기'}
                  </button>
                  <button
                    onClick={() => handleDeleteBand(band.id, band.name)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Album Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              앨범 목록 ({filteredAlbums.length})
              {selectedBand && ` - ${bands.find(b => b.id === selectedBand)?.name}`}
            </h2>
            <button
              onClick={() => setShowAlbumForm(!showAlbumForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all font-medium"
            >
              {showAlbumForm ? '취소' : '+ 앨범 추가'}
            </button>
          </div>

          {/* Album Form */}
          {showAlbumForm && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">새 앨범 추가</h3>
              <form onSubmit={handleAlbumSubmit} className="space-y-4">
                <select
                  value={albumForm.band_id}
                  onChange={(e) => setAlbumForm({ ...albumForm, band_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">밴드 선택 *</option>
                  {bands.map((band) => (
                    <option key={band.id} value={band.id}>{band.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="앨범 제목 *"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="발매년도 (예: 2022)"
                    value={albumForm.release_year}
                    onChange={(e) => setAlbumForm({ ...albumForm, release_year: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="장르 (쉼표로 구분)"
                    value={albumForm.genres}
                    onChange={(e) => setAlbumForm({ ...albumForm, genres: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="레이블"
                    value={albumForm.label}
                    onChange={(e) => setAlbumForm({ ...albumForm, label: e.target.value })}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                </div>
                {/* Album Cover Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    앨범 커버 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAlbumCoverFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    disabled={uploading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '앨범 추가'}
                </button>
              </form>
            </div>
          )}

          {/* Album List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAlbums.map((album) => (
              <div key={album.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-4 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{album.title}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>🎸 {album.band?.name}</p>
                  {album.release_year && <p>📅 {album.release_year}</p>}
                  {album.genres.length > 0 && <p>🎵 {album.genres.join(', ')}</p>}
                </div>
                <button
                  onClick={() => handleDeleteAlbum(album.id, album.title)}
                  className="mt-4 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
