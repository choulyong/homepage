/**
 * Page Background Component
 * 페이지별 배경화면 및 텍스트 색상 적용
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getPageBackground, type PageBackground } from '@/app/actions/backgrounds';
import { useTheme } from '@/contexts/ThemeContext';

export function PageBackground() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [background, setBackground] = useState<PageBackground | null>(null);

  useEffect(() => {
    const loadBackground = async () => {
      const result = await getPageBackground(pathname);
      if (result.success && result.background) {
        setBackground(result.background);

        // 다크모드 확인 (theme prop 사용)
        const isDarkMode = theme === 'dark';

        // 텍스트 색상을 CSS 변수로 설정
        // 이제 CSS에서 라이트모드는 어두운 색상, 다크모드는 밝은 색상을 자동으로 사용하므로
        // 여기서는 DB에 저장된 색상이 있어도 무시하고 CSS가 처리하도록 함
        // (배경 오버레이와 텍스트 그림자로 가독성이 크게 개선됨)

        // 배경이 있음을 body에 표시 (페이지에서 조건부 스타일링을 위해)
        document.body.setAttribute('data-has-background', 'true');
      } else {
        setBackground(null);
        // 기본 색상으로 복원
        document.documentElement.style.removeProperty('--page-text-color');
        document.body.removeAttribute('data-has-background');
      }
    };

    loadBackground();
  }, [pathname, theme]);

  useEffect(() => {
    // 컴포넌트 언마운트 시 CSS 변수 제거
    return () => {
      document.documentElement.style.removeProperty('--page-text-color');
    };
  }, []);

  if (!background) {
    return null;
  }

  return (
    <>
      {/* 배경색 레이어 */}
      {background.background_color && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: background.background_color,
            zIndex: -2,
          }}
          aria-hidden="true"
        />
      )}
      {/* 배경 이미지 레이어 */}
      {background.background_url && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url(${background.background_url})`,
              opacity: background.opacity,
              zIndex: -1,
            }}
            aria-hidden="true"
          />
          {/* 적응형 오버레이: 라이트모드에서 어두운 오버레이, 다크모드에서 투명 */}
          <div
            className="fixed inset-0 pointer-events-none bg-overlay"
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
}
