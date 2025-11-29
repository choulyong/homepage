/**
 * Background Settings Admin Page
 * 페이지별 배경화면 설정 (관리자 전용)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getAllPageBackgrounds,
  setPageBackground,
  deletePageBackground,
  type PageBackground,
} from '@/app/actions/backgrounds';

// 사용 가능한 페이지 목록 (실제 Rock Community 메뉴 구조)
const AVAILABLE_PAGES = [
  { path: '/', label: 'Home (홈)' },
  { path: '/about', label: 'About' },
  { path: '/bands', label: 'Bands' },
  { path: '/bands/countries', label: 'By Country' },
  { path: '/albums', label: 'Albums' },
  { path: '/albums/korean', label: 'K-Rock' },
  { path: '/concerts', label: 'Concerts' },
  { path: '/community', label: 'Community' },
  { path: '/news', label: 'News' },
  { path: '/gallery', label: '회원동영상' },
  { path: '/rock-art', label: 'Rock Art' },
  { path: '/videos', label: 'Videos' },
  { path: '/contact', label: 'Contact' },
];

export default function BackgroundsAdminPage() {
  const [backgrounds, setBackgrounds] = useState<PageBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 폼 상태
  const [selectedPage, setSelectedPage] = useState('/');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [opacity, setOpacity] = useState(0.5);
  const [textColor, setTextColor] = useState('#000000');

  // 배경화면 목록 로드
  const loadBackgrounds = async () => {
    setLoading(true);
    const result = await getAllPageBackgrounds();
    if (result.success && result.backgrounds) {
      setBackgrounds(result.backgrounds);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBackgrounds();
  }, []);

  // 페이지 선택 시 기존 설정 불러오기
  useEffect(() => {
    const existing = backgrounds.find((bg) => bg.page_path === selectedPage);
    if (existing) {
      setBackgroundUrl(existing.background_url);
      setBackgroundColor(existing.background_color || '');
      setOpacity(existing.opacity);
      setTextColor(existing.text_color || '#000000');
    } else {
      setBackgroundUrl('');
      setBackgroundColor('');
      setOpacity(0.5);
      setTextColor('#000000');
    }
  }, [selectedPage, backgrounds]);

  // 저장
  const handleSave = async () => {
    if (!backgroundUrl.trim() && !backgroundColor.trim()) {
      alert('배경 이미지 URL 또는 배경색을 입력하세요');
      return;
    }

    setSaving(true);
    const result = await setPageBackground(
      selectedPage,
      backgroundUrl,
      opacity,
      textColor,
      backgroundColor || null
    );

    if (result.success) {
      alert('저장되었습니다');
      await loadBackgrounds();
    } else {
      alert('저장 실패: ' + result.error);
    }
    setSaving(false);
  };

  // 삭제
  const handleDelete = async (pagePath: string) => {
    if (!confirm('이 페이지의 배경화면을 삭제하시겠습니까?')) return;

    const result = await deletePageBackground(pagePath);
    if (result.success) {
      alert('삭제되었습니다');
      await loadBackgrounds();
    } else {
      alert('삭제 실패: ' + result.error);
    }
  };

  // 파일 업로드
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'backgrounds');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업로드 실패');
      }

      const data = await response.json();
      setBackgroundUrl(data.url); // 업로드된 URL을 자동으로 입력
      alert('이미지가 업로드되었습니다');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('업로드 실패: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        배경화면 설정
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 설정 폼 */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            배경화면 추가/수정
          </h2>

          <div className="space-y-6">
            {/* 페이지 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                페이지 선택
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              >
                {AVAILABLE_PAGES.map((page) => (
                  <option key={page.path} value={page.path}>
                    {page.label} ({page.path})
                  </option>
                ))}
              </select>
            </div>

            {/* 배경 이미지 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                배경 이미지 URL (선택)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg 또는 /uploads/backgrounds/image.jpg"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploading ? '업로드 중...' : '찾기'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL을 직접 입력하거나 "찾기" 버튼으로 이미지를 업로드하세요
              </p>
            </div>

            {/* 배경색 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                배경색 (선택)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={backgroundColor || '#FFFFFF'}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-12 w-20 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#FFFFFF 또는 rgba(255, 255, 255, 0.5)"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                배경 이미지 대신 또는 함께 사용할 배경색
              </p>
            </div>

            {/* 투명도 조절 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                투명도: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>투명 (0%)</span>
                <span>불투명 (100%)</span>
              </div>
            </div>

            {/* 텍스트 색상 선택 - 더 이상 사용되지 않음 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    자동 텍스트 가독성 시스템 적용됨
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    모든 페이지에서 배경 이미지 위의 텍스트 가독성이 자동으로 최적화됩니다:
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                    <li>라이트모드: 어두운 오버레이 + 어두운 텍스트 + 밝은 그림자</li>
                    <li>다크모드: 반투명 오버레이 + 밝은 텍스트 + 어두운 그림자</li>
                    <li>콘텐츠 영역: 강화된 반투명 배경 + 블러 효과 + 박스 그림자</li>
                    <li>투명도: 30~50% 권장 (배경 이미지가 잘 보이면서 가독성 유지)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 미리보기 - 실제 적용될 스타일 반영 */}
            {(backgroundUrl || backgroundColor) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  미리보기 (실제 적용될 스타일)
                </label>
                <div className="relative h-40 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                  {/* 배경색 */}
                  {backgroundColor && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: backgroundColor,
                      }}
                    />
                  )}
                  {/* 배경 이미지 */}
                  {backgroundUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${backgroundUrl})`,
                        opacity: opacity,
                      }}
                    />
                  )}
                  {/* 가독성 오버레이 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                    }}
                  />
                  {/* 콘텐츠 카드 시뮬레이션 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 p-4">
                    <div className="bg-white/92 dark:bg-slate-900/85 backdrop-blur-md px-6 py-4 rounded-lg shadow-lg">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
                          style={{ textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)' }}>
                        페이지 제목
                      </h1>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        이렇게 적용됩니다
                      </p>
                    </div>
                    <p className="text-white bg-black/70 px-3 py-1 rounded text-xs font-medium">
                      투명도: {Math.round(opacity * 100)}% | 자동 가독성 최적화 적용됨
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 저장 버튼 */}
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving || (!backgroundUrl.trim() && !backgroundColor.trim())}
              className="w-full"
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </Card>

        {/* 설정된 배경화면 목록 */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            설정된 배경화면
          </h2>

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              로딩 중...
            </p>
          ) : backgrounds.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              설정된 배경화면이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {backgrounds.map((bg) => {
                const pageInfo = AVAILABLE_PAGES.find(
                  (p) => p.path === bg.page_path
                );
                return (
                  <div
                    key={bg.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {pageInfo?.label || bg.page_path}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {bg.page_path}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bg.page_path)}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>

                    {/* 미니 미리보기 */}
                    <div className="relative h-24 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-2">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${bg.background_url})`,
                          opacity: bg.opacity,
                        }}
                      />
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p>투명도: {Math.round(bg.opacity * 100)}%</p>
                      <p className="truncate" title={bg.background_url}>
                        URL: {bg.background_url}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* 사용 방법 안내 */}
      <Card padding="lg" className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📖 사용 방법
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              <strong>페이지 선택</strong>: 배경화면을 적용할 페이지를 선택하세요
            </li>
            <li>
              <strong>이미지 선택</strong>: 두 가지 방법으로 배경 이미지를 선택할 수 있습니다
              <ul className="mt-1 ml-4 space-y-1">
                <li>
                  <strong>찾기 버튼</strong>: 로컬 이미지 파일을 선택하면 자동으로 개인 서버의{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    /uploads/backgrounds/
                  </code>{' '}
                  폴더에 업로드됩니다
                </li>
                <li>
                  <strong>URL 직접 입력</strong>: 외부 URL(
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    https://example.com/image.jpg
                  </code>
                  ) 또는 이미 업로드된 이미지 경로를 입력하세요
                </li>
              </ul>
            </li>
            <li>
              <strong>투명도 조절</strong>: 슬라이더로 배경 이미지의 투명도를
              조절하세요
              <ul className="mt-1 ml-4 space-y-1">
                <li>
                  <strong>30~50% 권장</strong>: 배경 이미지가 잘 보이면서 텍스트 가독성도 유지됩니다
                </li>
                <li>자동 오버레이와 텍스트 그림자가 적용되어 어떤 투명도에서도 가독성이 보장됩니다</li>
              </ul>
            </li>
            <li>
              <strong>자동 텍스트 가독성</strong>: 텍스트 색상을 수동으로 설정할 필요가 없습니다
              <ul className="mt-1 ml-4 space-y-1">
                <li>라이트모드: 어두운 텍스트 + 밝은 그림자 자동 적용</li>
                <li>다크모드: 밝은 텍스트 + 어두운 그림자 자동 적용</li>
                <li>콘텐츠 영역에 강화된 반투명 배경이 자동으로 추가됩니다</li>
              </ul>
            </li>
            <li>
              <strong>미리보기 확인</strong>: 실제 적용될 스타일과 동일한 미리보기를 확인할 수 있습니다
            </li>
            <li>
              <strong>저장</strong>: 저장 버튼을 누르면 즉시 적용됩니다. 해당 페이지를 새로고침하면 배경이 적용됩니다
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
