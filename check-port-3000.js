const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/', { timeout: 5000 });

    const title = await page.title();
    const content = await page.content();

    console.log('=== Page Title ===');
    console.log(title);
    console.log('\n=== Page URL ===');
    console.log(page.url());
    console.log('\n=== First 1000 characters of HTML ===');
    console.log(content.substring(0, 1000));

  } catch (error) {
    console.error('Error accessing localhost:3000:', error.message);
  }

  await browser.close();
})();
