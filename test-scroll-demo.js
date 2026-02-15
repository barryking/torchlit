/**
 * Manual test script for tour scroll-to-target behavior.
 * Run: node test-scroll-demo.js
 * Requires: npm install -D playwright && npx playwright install chromium
 */
import { chromium } from 'playwright';

// Try 5175 first (user-specified), fallback to 5173 (default Vite)
const PORT = process.env.PORT || 5175;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Navigate
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 2. Initial screenshot
    await page.screenshot({ path: 'test-screenshot-1-initial.png', fullPage: true });
    console.log('Saved: test-screenshot-1-initial.png');

    // 3. Click Recipes in sidebar
    const recipesNav = page.locator('.nav-item[data-page="recipes"]');
    await recipesNav.click();
    await page.waitForTimeout(800);

    // 4. Click ? button to start Recipes Help tour
    const helpBtn = page.locator('#btn-help');
    await helpBtn.click();
    await page.waitForTimeout(1200);

    // 5. Screenshot of first tour step
    await page.screenshot({ path: 'test-screenshot-2-tour-started.png' });
    console.log('Saved: test-screenshot-2-tour-started.png');

    // 6. Advance to step 3 (recipes-spa - the tall SPA Multi-View section)
    const nextBtn = page.locator('torchlit-overlay').locator('button:has-text("Next")');
    await nextBtn.click(); // step 2
    await page.waitForTimeout(600);
    await nextBtn.click(); // step 3 - recipes-spa
    await page.waitForTimeout(1500); // wait for scroll to settle

    // 7. Screenshot showing tall target scroll behavior
    await page.screenshot({ path: 'test-screenshot-3-tall-target.png' });
    console.log('Saved: test-screenshot-3-tall-target.png');

    // 8. Also test main Feature Tour from top
    await page.keyboard.press('Escape'); // close recipes-help
    await page.waitForTimeout(500);
    await page.goto(BASE_URL + '/'); // back to overview
    await page.waitForTimeout(500);

    // Reset tour state and trigger onboarding
    await page.evaluate(() => {
      const overlay = document.querySelector('torchlit-overlay');
      if (overlay?.service) overlay.service.resetAll();
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // onboarding may auto-start

    await page.screenshot({ path: 'test-screenshot-4-onboarding.png' });
    console.log('Saved: test-screenshot-4-onboarding.png');

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: 'test-screenshot-error.png' });
  } finally {
    await browser.close();
  }
}

main();
