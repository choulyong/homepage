'use client';

import { useState } from 'react';
import Link from 'next/link';
import YouTubePlayer from '@/components/YouTubePlayer';

interface Album {
  id: string;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  youtube_url: string | null;
}

interface AlbumGridProps {
  albums: Album[];
  bandName?: string;
}

export default function AlbumGrid({ albums, bandName }: AlbumGridProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="relative group">
            <Link
              href={`/albums/${album.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-zinc-800 hover:border-amber-500 transition-all duration-300 hover:shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden relative">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-6xl">💿</span>
                  )}

                  {/* YouTube Play Button Overlay */}
                  {album.youtube_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedAlbum(album);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-lg"
                        title="Play on YouTube"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {album.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {album.release_year && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {album.release_year}
                      </p>
                    )}
                    {album.youtube_url && (
                      <span className="text-xs text-red-500" title="YouTube available">
                        ▶️
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* YouTube Player Modal - Outside of Link */}
      {selectedAlbum && selectedAlbum.youtube_url && (
        <YouTubePlayer
          youtubeUrl={selectedAlbum.youtube_url}
          albumTitle={selectedAlbum.title}
          bandName={bandName}
          isOpen={true}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
}
