/**
 * Color Contrast Checker using Playwright
 * 라이트/다크 모드에서 색상 대비 확인
 */

const { chromium } = require('playwright');

// WCAG AA 기준: 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
const MIN_CONTRAST_RATIO = 4.5;

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

async function checkContrast() {
  console.log('🎨 색상 대비 확인 시작...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  // 라이트 모드 테스트
  console.log('☀️  라이트 모드 확인 중...');
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');

  // 다크모드 클래스 제거
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  });

  await page.waitForTimeout(1000);

  // 히어로 섹션 텍스트 확인
  const heroTitle = await page.locator('h1 span.gradient-text').first();
  const heroSubtitle = await page.locator('section p').first();

  if (await heroTitle.isVisible()) {
    const titleColor = await heroTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const titleBg = await heroTitle.evaluate(el => {
      let element = el;
      while (element) {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        element = element.parentElement;
      }
      return 'rgb(255, 255, 255)'; // 기본 흰색 배경
    });

    console.log('  제목 색상:', titleColor);
    console.log('  배경 색상:', titleBg);

    results.push({
      mode: 'light',
      element: '히어로 제목',
      textColor: titleColor,
      bgColor: titleBg
    });
  }

  if (await heroSubtitle.isVisible()) {
    const subtitleColor = await heroSubtitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const subtitleBg = await heroSubtitle.evaluate(el => {
      let element = el;
      while (element) {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        element = element.parentElement;
      }
      return 'rgb(255, 255, 255)';
    });

    console.log('  부제목 색상:', subtitleColor);
    console.log('  배경 색상:', subtitleBg);

    results.push({
      mode: 'light',
      element: '히어로 부제목',
      textColor: subtitleColor,
      bgColor: subtitleBg
    });
  }

  // 다크 모드 테스트
  console.log('\n🌙 다크 모드 확인 중...');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  });

  await page.waitForTimeout(1000);

  if (await heroTitle.isVisible()) {
    const titleColor = await heroTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const titleBg = await heroTitle.evaluate(el => {
      let element = el;
      while (element) {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        element = element.parentElement;
      }
      return 'rgb(15, 23, 42)'; // 다크 모드 기본 배경
    });

    console.log('  제목 색상:', titleColor);
    console.log('  배경 색상:', titleBg);

    results.push({
      mode: 'dark',
      element: '히어로 제목',
      textColor: titleColor,
      bgColor: titleBg
    });
  }

  if (await heroSubtitle.isVisible()) {
    const subtitleColor = await heroSubtitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    const subtitleBg = await heroSubtitle.evaluate(el => {
      let element = el;
      while (element) {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        element = element.parentElement;
      }
      return 'rgb(15, 23, 42)';
    });

    console.log('  부제목 색상:', subtitleColor);
    console.log('  배경 색상:', subtitleBg);

    results.push({
      mode: 'dark',
      element: '히어로 부제목',
      textColor: subtitleColor,
      bgColor: subtitleBg
    });
  }

  await browser.close();

  // 결과 분석
  console.log('\n📊 색상 대비 분석 결과:\n');

  const parseRgb = (rgbString) => {
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return { r: 128, g: 128, b: 128 };
  };

  results.forEach(result => {
    const textRgb = parseRgb(result.textColor);
    const bgRgb = parseRgb(result.bgColor);
    const ratio = contrastRatio(textRgb, bgRgb);
    const pass = ratio >= MIN_CONTRAST_RATIO;

    console.log(`[${result.mode.toUpperCase()}] ${result.element}`);
    console.log(`  대비: ${ratio.toFixed(2)}:1 ${pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  텍스트: ${result.textColor}`);
    console.log(`  배경: ${result.bgColor}`);
    console.log('');
  });

  console.log('✅ 색상 대비 확인 완료!\n');
}

checkContrast().catch(console.error);
