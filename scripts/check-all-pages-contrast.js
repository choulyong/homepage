/**
 * Comprehensive Color Contrast Checker for All Pages
 * 모든 주요 페이지의 라이트/다크 모드 색상 대비 확인
 */

const { chromium } = require('playwright');

const MIN_CONTRAST_RATIO = 4.5; // WCAG AA 기준

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(rgb1, rgb2) {
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseRgb(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return { r: 128, g: 128, b: 128 };
}

async function checkPageContrast(page, url, mode) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // 모드 설정
  if (mode === 'dark') {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    });
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    });
  }

  await page.waitForTimeout(500);

  const results = [];

  // 주요 텍스트 요소들 확인
  const selectors = [
    { selector: 'h1', name: '주요 제목 (h1)' },
    { selector: 'h2', name: '부제목 (h2)' },
    { selector: 'p', name: '본문 (p)' },
    { selector: '.hero-subtitle', name: '히어로 부제목' },
  ];

  for (const { selector, name } of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const textColor = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.color;
        });

        const bgColor = await element.evaluate(el => {
          let current = el;
          while (current) {
            const style = window.getComputedStyle(current);
            const bg = style.backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              return bg;
            }
            current = current.parentElement;
          }
          return mode === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)';
        });

        const textRgb = parseRgb(textColor);
        const bgRgb = parseRgb(bgColor);
        const ratio = contrastRatio(textRgb, bgRgb);
        const pass = ratio >= MIN_CONTRAST_RATIO;

        results.push({
          element: name,
          textColor,
          bgColor,
          ratio: ratio.toFixed(2),
          pass
        });
      }
    } catch (e) {
      // 요소가 없으면 스킵
    }
  }

  return results;
}

async function checkAllPages() {
  console.log('🎨 전체 페이지 색상 대비 확인 시작...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:3002', name: '홈페이지' },
    { url: 'http://localhost:3002/board/ai_study', name: 'AI 스터디' },
    { url: 'http://localhost:3002/board/bigdata_study', name: '빅데이터 스터디' },
    { url: 'http://localhost:3002/free-board', name: '자유게시판' },
    { url: 'http://localhost:3002/running', name: '러닝 트래커' },
    { url: 'http://localhost:3002/gallery', name: '갤러리' },
  ];

  for (const { url, name } of pages) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📄 ${name}`);
    console.log('='.repeat(50));

    try {
      // 라이트 모드
      console.log('\n☀️  라이트 모드:');
      const lightResults = await checkPageContrast(page, url, 'light');
      lightResults.forEach(result => {
        const icon = result.pass ? '✅' : '❌';
        console.log(`  ${icon} ${result.element}: ${result.ratio}:1`);
        if (!result.pass) {
          console.log(`     텍스트: ${result.textColor}, 배경: ${result.bgColor}`);
        }
      });

      // 다크 모드
      console.log('\n🌙 다크 모드:');
      const darkResults = await checkPageContrast(page, url, 'dark');
      darkResults.forEach(result => {
        const icon = result.pass ? '✅' : '❌';
        console.log(`  ${icon} ${result.element}: ${result.ratio}:1`);
        if (!result.pass) {
          console.log(`     텍스트: ${result.textColor}, 배경: ${result.bgColor}`);
        }
      });
    } catch (error) {
      console.log(`  ⚠️  페이지 확인 실패: ${error.message}`);
    }
  }

  await browser.close();

  console.log('\n\n✅ 전체 페이지 색상 대비 확인 완료!\n');
}

checkAllPages().catch(console.error);
