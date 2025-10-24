/**
 * Playwright Test Script for rock.metaldragon.co.kr
 * Checks domain accessibility and identifies issues
 */

const { chromium } = require('playwright');

async function testDomain() {
  console.log('🔍 Testing rock.metaldragon.co.kr with Playwright...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Collect network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });

  try {
    // Test 1: Homepage
    console.log('📍 Test 1: Loading homepage (rock.metaldragon.co.kr)');
    const homeResponse = await page.goto('http://rock.metaldragon.co.kr', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${homeResponse?.status()}`);
    console.log(`   URL: ${page.url()}`);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
    console.log('   ✅ Screenshot saved: screenshots/homepage.png\n');

    // Test 2: Albums page
    console.log('📍 Test 2: Loading /albums page');
    const albumsResponse = await page.goto('http://rock.metaldragon.co.kr/albums', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${albumsResponse?.status()}`);
    console.log(`   URL: ${page.url()}`);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/albums-page.png', fullPage: true });
    console.log('   ✅ Screenshot saved: screenshots/albums-page.png\n');

    // Test 3: Specific album detail page
    console.log('📍 Test 3: Loading specific album page');
    const albumDetailResponse = await page.goto('http://rock.metaldragon.co.kr/albums/1', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${albumDetailResponse?.status()}`);
    console.log(`   URL: ${page.url()}`);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/album-detail.png', fullPage: true });
    console.log('   ✅ Screenshot saved: screenshots/album-detail.png\n');

    // Test 4: Genres page
    console.log('📍 Test 4: Loading /albums/genres page');
    const genresResponse = await page.goto('http://rock.metaldragon.co.kr/albums/genres', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${genresResponse?.status()}`);
    console.log(`   URL: ${page.url()}`);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/genres-page.png', fullPage: true });
    console.log('   ✅ Screenshot saved: screenshots/genres-page.png\n');

    // Report console errors
    console.log('\n📊 Console Messages:');
    if (consoleMessages.length === 0) {
      console.log('   ✅ No console messages');
    } else {
      const errors = consoleMessages.filter(m => m.type === 'error');
      const warnings = consoleMessages.filter(m => m.type === 'warning');

      if (errors.length > 0) {
        console.log(`   ❌ ${errors.length} Errors:`);
        errors.slice(0, 5).forEach(err => {
          console.log(`      - ${err.text}`);
        });
      }

      if (warnings.length > 0) {
        console.log(`   ⚠️  ${warnings.length} Warnings:`);
        warnings.slice(0, 3).forEach(warn => {
          console.log(`      - ${warn.text}`);
        });
      }
    }

    // Report network errors
    console.log('\n🌐 Network Errors:');
    if (networkErrors.length === 0) {
      console.log('   ✅ No network errors');
    } else {
      console.log(`   ❌ ${networkErrors.length} Failed Requests:`);
      networkErrors.slice(0, 10).forEach(err => {
        console.log(`      - ${err.url}`);
        console.log(`        Reason: ${err.failure?.errorText || 'Unknown'}`);
      });
    }

    // Check for specific elements
    console.log('\n🔎 Page Content Check:');

    await page.goto('http://rock.metaldragon.co.kr', { waitUntil: 'networkidle' });
    const hasMetaldragonHeading = await page.locator('text=METALDRAGON').count() > 0;
    const hasFeatureCards = await page.locator('[class*="FeatureCard"]').count() > 0;
    const hasGradient = await page.locator('.gradient-text').count() > 0;

    console.log(`   METALDRAGON heading: ${hasMetaldragonHeading ? '✅' : '❌'}`);
    console.log(`   Feature cards: ${hasFeatureCards ? '✅' : '❌'}`);
    console.log(`   Gradient text: ${hasGradient ? '✅' : '❌'}`);

    console.log('\n✨ Test completed!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    console.log('   Error screenshot saved: screenshots/error.png');
  } finally {
    await browser.close();
  }
}

testDomain()
  .then(() => {
    console.log('\n🎉 All tests finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
