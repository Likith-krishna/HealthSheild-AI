import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.addInitScript(() => {
  window.addEventListener('error', event => {
    console.log("REAL_ERROR_CAUGHT:", event.error ? event.error.stack : event.message);
  });
  window.addEventListener('unhandledrejection', event => {
    console.log("PROMISE_ERROR:", event.reason ? event.reason.stack : event.reason);
  });
  // Overriding console.error to capture React errors
  const originalError = console.error;
  console.error = (...args) => {
    console.log("REACT_CONSOLE_ERROR:", args.map(a => (a && a.stack) ? a.stack : typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
    originalError.apply(console, args);
  };
});

page.on('console', msg => {
  const text = msg.text();
  if (text.includes('REAL_ERROR_CAUGHT:') || text.includes('REACT_CONSOLE_ERROR:') || text.includes('PROMISE_ERROR:')) {
    console.log(text);
  }
});

await page.goto('http://localhost:3000/login');

// Login flow
await page.fill('input[type="text"]', 'testuser@example.com');
await page.fill('input[type="password"]', 'Password123!');
await page.click('button[type="submit"]');

await page.waitForTimeout(3000);
await page.click('button:has-text("Health Data Input")').catch(() => {});
await page.waitForTimeout(3000);

await browser.close();
