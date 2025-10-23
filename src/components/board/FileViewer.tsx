/**
 * 파일 뷰어 컴포넌트
 * 다양한 파일 형식을 표시하고 다운로드 기능 제공
 */

'use client';

interface FileViewerProps {
  fileUrls: string[];
}

export function FileViewer({ fileUrls }: FileViewerProps) {
  if (!fileUrls || fileUrls.length === 0) {
    return null;
  }

  const getFileInfo = (url: string) => {
    const fileName = url.split('/').pop() || '';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    const fileTypes: Record<string, { icon: string; label: string; color: string }> = {
      // 이미지
      jpg: { icon: '🖼️', label: '이미지', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      jpeg: { icon: '🖼️', label: '이미지', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      png: { icon: '🖼️', label: '이미지', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      webp: { icon: '🖼️', label: '이미지', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      gif: { icon: '🖼️', label: 'GIF', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      svg: { icon: '🖼️', label: 'SVG', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      bmp: { icon: '🖼️', label: '이미지', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },

      // 동영상
      mp4: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      avi: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      mov: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      wmv: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      flv: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      mkv: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      webm: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      mpeg: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      mpg: { icon: '🎬', label: '동영상', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },

      // 문서
      pdf: { icon: '📄', label: 'PDF', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      doc: { icon: '📝', label: 'Word', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      docx: { icon: '📝', label: 'Word', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      xls: { icon: '📊', label: 'Excel', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      xlsx: { icon: '📊', label: 'Excel', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      ppt: { icon: '📊', label: 'PowerPoint', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      pptx: { icon: '📊', label: 'PowerPoint', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },

      // 텍스트/코드
      md: { icon: '📝', label: 'Markdown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      txt: { icon: '📄', label: 'Text', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      json: { icon: '{}', label: 'JSON', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      csv: { icon: '📊', label: 'CSV', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      xml: { icon: '<>', label: 'XML', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },

      // 압축파일
      zip: { icon: '🗜️', label: 'ZIP', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      rar: { icon: '🗜️', label: 'RAR', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      '7z': { icon: '🗜️', label: '7Z', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    };

    return fileTypes[fileExt] || { icon: '📎', label: '파일', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
  };

  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext || '');
  };

  const isVideo = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'].includes(ext || '');
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        첨부 파일 ({fileUrls.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fileUrls.map((url: string, index: number) => {
          const fileInfo = getFileInfo(url);
          const fileName = url.split('/').pop() || '';

          if (isImage(url)) {
            return (
              <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <img
                  src={url}
                  alt={fileName}
                  className="w-full h-auto object-contain max-h-96"
                />
                <a
                  href={url}
                  download
                  className="absolute bottom-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  다운로드
                </a>
              </div>
            );
          }

          if (isVideo(url)) {
            return (
              <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <video
                  src={url}
                  controls
                  className="w-full h-auto max-h-96"
                >
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
                <a
                  href={url}
                  download
                  className="absolute bottom-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  다운로드
                </a>
              </div>
            );
          }

          // 기타 파일
          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-colors"
            >
              <div className="text-5xl">{fileInfo.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${fileInfo.color}`}>
                    {fileInfo.label}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </div>
              </div>
              <a
                href={url}
                download
                className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                다운로드
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
