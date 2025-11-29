'use client';

import { useState } from 'react';

interface YouTubePlayerProps {
  youtubeUrl: string;
  albumTitle: string;
  bandName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function YouTubePlayer({ youtubeUrl, albumTitle, bandName, isOpen: externalIsOpen, onClose }: YouTubePlayerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = onClose || (() => setInternalIsOpen(false));

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : url.split('/').pop();
  };

  const videoId = getVideoId(youtubeUrl);

  return (
    <>
      {/* Trigger Button - Only show if not externally controlled */}
      {externalIsOpen === undefined && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setInternalIsOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-lg"
          title="Play on YouTube"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {albumTitle}
                </h3>
                {bandName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bandName}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* YouTube Player */}
            <div className="relative pb-[56.25%] h-0 bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={albumTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </svg>
                YouTube에서 열기
              </a>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
