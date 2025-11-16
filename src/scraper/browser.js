import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getProxyConfig, getProxyArgs, authenticateProxy, testProxyConnection, logProxyConfig } from '../utils/proxy.js';

puppeteer.use(StealthPlugin());

// ============================================================================
// BROWSER ROTATION
// ============================================================================

/**
 * User agents for different browsers
 */
const USER_AGENTS = {
  chrome: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  ],
  edge: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0'
  ],
  firefox: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0'
  ]
};

/**
 * Select a random browser from the configured list
 * @param {Object} config - Configuration object
 * @returns {string} Selected browser name
 */
function selectBrowser(config) {
  const browserRotation = config.session?.browserRotation;
  
  if (!browserRotation?.enabled) {
    console.log('ℹ️  Browser rotation disabled, using Chrome');
    return 'chrome';
  }
  
  const browsers = browserRotation.browsers || ['chrome'];
  
  if (!browserRotation.randomize) {
    console.log(`ℹ️  Using first browser: ${browsers[0]}`);
    return browsers[0];
  }
  
  // Select random browser
  const selectedBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  console.log(`🎲 Randomly selected browser: ${selectedBrowser}`);
  
  return selectedBrowser;
}

/**
 * Get a random user agent for the selected browser
 * @param {string} browser - Browser name
 * @returns {string} User agent string
 */
function getRandomUserAgent(browser) {
  const agents = USER_AGENTS[browser] || USER_AGENTS.chrome;
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Get browser executable path (for Edge and Firefox)
 * @param {string} browser - Browser name
 * @returns {string|undefined} Executable path or undefined for Chrome
 */
function getBrowserExecutable(browser) {
  if (browser === 'edge') {
    // Common Edge paths on Windows
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    
    // Return first existing path (Puppeteer will handle if not found)
    return edgePaths[0];
  }
  
  if (browser === 'firefox') {
    // Common Firefox paths on Windows
    const firefoxPaths = [
      'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
    ];
    
    return firefoxPaths[0];
  }
  
  // Chrome is default, no need to specify path
  return undefined;
}

// ============================================================================
// SESSION PREPARATION
// ============================================================================

/**
 * Prepare browser session with randomization and proxy support
 * @param {Object} config - Configuration object
 * @returns {Object} Session information
 */
export function prepareSession(config) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 PREPARING NEW SESSION');
  console.log('='.repeat(70) + '\n');
  
  // Select browser
  const browser = selectBrowser(config);
  const userAgent = getRandomUserAgent(browser);
  const executablePath = getBrowserExecutable(browser);
  
  // Get proxy configuration
  const proxyConfig = getProxyConfig(config);
  
  // Log session details
  console.log('📋 Session Configuration:');
  console.log(`   Browser:     ${browser.toUpperCase()}`);
  console.log(`   User Agent:  ${userAgent.substring(0, 80)}...`);
  console.log(`   Proxy:       ${proxyConfig ? 'Enabled' : 'Disabled'}`);
  console.log('');
  
  if (proxyConfig) {
    logProxyConfig(proxyConfig);
  }
  
  return {
    browser,
    userAgent,
    executablePath,
    proxyConfig
  };
}

// ============================================================================
// BROWSER INITIALIZATION
// ============================================================================

/**
 * Initialize browser with session configuration
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Browser and page objects
 */
export async function initBrowser(config) {
  // Prepare session
  const session = prepareSession(config);
  
  // Base launch arguments
  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--window-size=1920,1080',
    '--start-maximized',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-dev-shm-usage',
    '--disable-extensions',  // Disable all extensions
    '--disable-plugins',     // Disable plugins
    '--incognito'            // Always use clean profile
  ];
  
  // Add proxy arguments if configured
  const proxyArgs = session.proxyConfig ? getProxyArgs(session.proxyConfig) : [];
  
  // Add certificate error handling for proxy
  const proxySecurityArgs = session.proxyConfig ? [
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--allow-insecure-localhost'
  ] : [];
  
  const allArgs = [...baseArgs, ...proxyArgs, ...proxySecurityArgs];
  
  // Launch options
  const launchOptions = {
    headless: config.monitoring.headless,
    args: allArgs,
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null,
    ignoreHTTPSErrors: true  // Ignore SSL certificate errors (required for proxies)
  };
  
  // Add executable path for Edge/Firefox
  if (session.executablePath) {
    launchOptions.executablePath = session.executablePath;
  }
  
  console.log(`🌐 Launching ${session.browser.toUpperCase()} browser...`);
  
  try {
    const browser = await puppeteer.launch(launchOptions);
    
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();
    
    // Authenticate proxy if configured
    if (session.proxyConfig) {
      await authenticateProxy(page, session.proxyConfig);
    }
    
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
      
      // Override webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    // Set user agent
    await page.setUserAgent(session.userAgent);
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    });
    
    console.log(`✅ ${session.browser.toUpperCase()} browser initialized successfully`);
    
    // Test proxy connection if enabled
    if (session.proxyConfig) {
      const proxyTest = await testProxyConnection(page);
      if (!proxyTest.success) {
        console.log('⚠️  Proxy test failed, but continuing...');
      }
    }
    
    console.log('='.repeat(70) + '\n');
    
    return { browser, page, session };
    
  } catch (error) {
    console.error(`❌ Failed to launch ${session.browser.toUpperCase()} browser:`, error.message);
    
    // Fallback to Chrome if other browser fails
    if (session.browser !== 'chrome') {
      console.log('⚠️  Falling back to Chrome...');
      
      const fallbackOptions = {
        headless: config.monitoring.headless,
        args: allArgs,
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: null
      };
      
      const browser = await puppeteer.launch(fallbackOptions);
      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : await browser.newPage();
      
      if (session.proxyConfig) {
        await authenticateProxy(page, session.proxyConfig);
      }
      
      await page.setUserAgent(getRandomUserAgent('chrome'));
      
      console.log('✅ Chrome browser initialized (fallback)');
      console.log('='.repeat(70) + '\n');
      
      return { browser, page, session: { ...session, browser: 'chrome' } };
    }
    
    throw error;
  }
}

/**
 * Close browser
 * @param {Browser} browser - Puppeteer browser object
 */
export async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}
