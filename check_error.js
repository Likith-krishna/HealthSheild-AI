import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('BROWSER_ERROR:', msg.text());
  }
});

page.on('pageerror', err => {
  console.log('PAGE_ERROR:', err.message);
});

await page.goto('http://localhost:3000/login');

// Login flow
await page.fill('input[type="text"]', 'testuser@example.com');
await page.fill('input[type="password"]', 'Password123!');
await page.click('button[type="submit"]');

// Wait for redirect to dashboard, then click Health Data Input
await page.waitForTimeout(3000);
await page.click('button:has-text("Health Data Input")').catch(() => console.log('Could not click Health Data Input tab'));

await page.waitForTimeout(3000);

await browser.close();
