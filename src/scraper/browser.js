import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function initBrowser(config) {
  const browser = await puppeteer.launch({
    headless: config.monitoring.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1920,1080',
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-dev-shm-usage',
      '--incognito'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  
  // Additional stealth measures
  await page.evaluateOnNewDocument(() => {
    // Override the navigator.platform property
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32',
    });
    
    // Override hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8,
    });
    
    // Override device memory
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8,
    });
  });
  
  // Set realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );

  // Set extra headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  });

  console.log('Browser initialized in incognito mode');
  
  return { browser, page };
}

export async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
  }
}
