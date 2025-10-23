const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 홈페이지 접속
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded');

    // 라이트 모드로 전환 (다크모드 토글 클릭)
    await page.waitForTimeout(1000);

    // 다크모드 토글 버튼 찾기
    const themeButton = await page.locator('button[aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")').first();
    if (await themeButton.count() > 0) {
      await themeButton.click();
      console.log('✅ Theme toggled to light mode');
      await page.waitForTimeout(500);
    }

    // 초기 스크린샷
    await page.screenshot({ path: 'menu-card-initial.png', fullPage: true });
    console.log('✅ Initial screenshot saved');

    // 메뉴 보드로 스크롤
    const menuSection = await page.locator('section:has-text("메뉴"), div:has-text("메뉴"), [class*="menu"]').first();
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled to menu section');
      await page.waitForTimeout(500);
    }

    // 메뉴 카드 부분 스크린샷
    await page.screenshot({ path: 'menu-card-after-scroll.png', fullPage: true });
    console.log('✅ After scroll screenshot saved');

    // 메뉴 카드 요소들의 배경색 추출
    const menuCards = await page.locator('[class*="card"], [class*="menu-item"], article, .bg-white, .bg-gray').all();
    console.log(`\n📊 Found ${menuCards.length} potential menu cards`);

    for (let i = 0; i < Math.min(menuCards.length, 10); i++) {
      const card = menuCards[i];
      const bgColor = await card.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          className: el.className,
          tagName: el.tagName
        };
      });
      console.log(`Card ${i + 1}:`, bgColor);
    }

    // HTML 구조 확인
    const bodyClasses = await page.evaluate(() => {
      return {
        html: document.documentElement.className,
        body: document.body.className
      };
    });
    console.log('\n🎨 Current theme classes:', bodyClasses);

    // 5초 대기하면서 변화 관찰
    console.log('\n⏳ Waiting 5 seconds to observe any changes...');
    await page.waitForTimeout(5000);

    // 최종 스크린샷
    await page.screenshot({ path: 'menu-card-final.png', fullPage: true });
    console.log('✅ Final screenshot saved');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'menu-card-error.png', fullPage: true });
  }

  await browser.close();
})();
