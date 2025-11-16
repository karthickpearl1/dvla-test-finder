import { randomDelay, typeWithDelay, clickWithDelay } from '../utils/delay.js';

const DVSA_LOGIN_URL = 'https://driverpracticaltest.dvsa.gov.uk/login';

// ============================================================================
// SECURITY BLOCK DETECTION & HANDLING
// ============================================================================

/**
 * Check if the current page is the DVSA security block page
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} Object containing isBlocked flag and details
 */
async function checkForSecurityBlock(page) {
  try {
    const blockInfo = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Primary check: "Access Denied" text
      const hasAccessDenied = bodyText.includes('Access Denied');
      
      // Secondary check: IP information (confirms it's the block page)
      const hasYourIP = bodyText.includes('Your IP:');
      const hasProxyIP = bodyText.includes('Proxy IP:');
      
      // Extract details if blocked
      let details = null;
      if (hasAccessDenied && (hasYourIP || hasProxyIP)) {
        // Extract error number
        const errorMatch = bodyText.match(/Error\s+(\d+)/);
        
        // Extract timestamp
        const timestampMatch = bodyText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+UTC)/);
        
        // Extract IPs
        const yourIPMatch = bodyText.match(/Your IP:\s*([\d.]+)/);
        const proxyIPMatch = bodyText.match(/Proxy IP:\s*([\d.]+)/);
        
        // Extract Incident ID
        const incidentMatch = bodyText.match(/Incident ID:\s*([\w-]+)/);
        
        details = {
          errorNumber: errorMatch ? errorMatch[1] : null,
          timestamp: timestampMatch ? timestampMatch[1] : null,
          yourIP: yourIPMatch ? yourIPMatch[1] : null,
          proxyIP: proxyIPMatch ? proxyIPMatch[1] : null,
          incidentID: incidentMatch ? incidentMatch[1] : null,
          url: window.location.href
        };
      }
      
      return {
        isBlocked: hasAccessDenied && (hasYourIP || hasProxyIP),
        details: details
      };
    });
    
    return blockInfo;
    
  } catch (error) {
    console.error('Error checking for security block:', error.message);
    return { isBlocked: false, error: error.message };
  }
}

/**
 * Handle the security block page - log details, send email, take screenshot
 * @param {Page} page - Puppeteer page object
 * @param {Object} blockInfo - Information about the block
 * @param {string} actionDescription - Description of action that triggered block
 */
async function handleSecurityBlock(page, blockInfo, actionDescription = 'unknown action') {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║          ⚠️  DVSA SECURITY BLOCK DETECTED  ⚠️            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  const details = blockInfo.details;
  
  console.log('📋 Block Information:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`   Triggered by:  ${actionDescription}`);
  console.log(`   Error Number:  ${details.errorNumber || 'N/A'}`);
  console.log(`   Timestamp:     ${details.timestamp || 'N/A'}`);
  console.log(`   Your IP:       ${details.yourIP || 'N/A'}`);
  console.log(`   Proxy IP:      ${details.proxyIP || 'N/A'}`);
  console.log(`   Incident ID:   ${details.incidentID || 'N/A'}`);
  console.log(`   Page URL:      ${details.url || 'N/A'}`);
  console.log('─────────────────────────────────────────────────────────────\n');
  
  // Take screenshot of block page
  let screenshotPath = null;
  try {
    const { takeScreenshot } = await import('../utils/screenshot.js');
    screenshotPath = await takeScreenshot(page, 'security-block');
    console.log(`✓ Screenshot saved: ${screenshotPath}\n`);
  } catch (error) {
    console.log('⚠️  Could not take screenshot:', error.message);
  }
  
  // Send email notification
  try {
    const { sendSecurityBlockAlert } = await import('../utils/email.js');
    await sendSecurityBlockAlert(blockInfo, actionDescription, screenshotPath);
    console.log('✓ Email notification sent\n');
  } catch (error) {
    console.log('⚠️  Could not send email notification:', error.message);
  }
  
  console.log('⚠️  Automation stopped due to security block.\n');
  
  // Throw error to stop execution
  const errorMessage = `SECURITY_BLOCK: Access denied by DVSA security system after ${actionDescription}`;
  if (screenshotPath) {
    throw new Error(`${errorMessage}|||${screenshotPath}`);
  } else {
    throw new Error(errorMessage);
  }
}

/**
 * Check for security block after any page interaction
 * Call this after navigation, clicks, or form submissions
 * @param {Page} page - Puppeteer page object
 * @param {string} actionDescription - Description of the action performed
 */
async function checkSecurityBlockAfterAction(page, actionDescription = 'page interaction') {
  // Brief wait for page to settle
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const blockInfo = await checkForSecurityBlock(page);
  
  if (blockInfo.isBlocked) {
    console.log(`\n⚠️  Security block triggered after: ${actionDescription}\n`);
    await handleSecurityBlock(page, blockInfo, actionDescription);
  }
  
  return blockInfo;
}

// ============================================================================
// CAPTCHA HANDLING
// ============================================================================

/**
 * Detect if CAPTCHA is present on the page
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<boolean>} True if CAPTCHA detected
 */
async function detectCaptcha(page) {
  try {
    const captchaSelectors = [
      '.imperva-captcha',
      '[class*="captcha"]',
      'iframe[src*="captcha"]',
      '#captcha',
      '.g-recaptcha',
      '.h-captcha'
    ];
    
    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`🔒 CAPTCHA detected: ${selector}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting CAPTCHA:', error.message);
    return false;
  }
}

/**
 * Handle CAPTCHA manually - pause for user to solve
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 */
async function handleCaptchaManually(page, config) {
  const timeout = config.monitoring?.manualInterventionTimeout || 30;
  
  console.log('\n' + '='.repeat(70));
  console.log('🔒 CAPTCHA CHALLENGE DETECTED 🔒');
  console.log('='.repeat(70));
  console.log('');
  console.log('⚠️  A CAPTCHA challenge has been detected on the page.');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('   1. Look at the browser window (it should be visible)');
  console.log('   2. Complete the CAPTCHA challenge manually');
  console.log('   3. Wait for the login form to appear');
  console.log('   4. Do NOT close the browser window');
  console.log('   5. Automation will resume automatically');
  console.log('');
  console.log(`⏱️  Waiting for ${timeout} seconds...`);
  console.log('='.repeat(70));
  console.log('');
  
  // Take screenshot of CAPTCHA
  try {
    const { takeScreenshot } = await import('../utils/screenshot.js');
    await takeScreenshot(page, 'captcha');
  } catch (error) {
    console.log('⚠️  Could not take CAPTCHA screenshot:', error.message);
  }
  
  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, timeout * 1000));
  
  console.log('✅ Resuming automation...\n');
}

/**
 * Handle CAPTCHA using third-party service (placeholder for future integration)
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>} True if solved successfully
 */
async function handleCaptchaWithService(page, config) {
  // Placeholder for third-party CAPTCHA solving service integration
  // Examples: 2Captcha, Anti-Captcha, CapSolver, etc.
  
  console.log('⚠️  Third-party CAPTCHA service not yet implemented');
  console.log('Falling back to manual CAPTCHA handling...\n');
  
  await handleCaptchaManually(page, config);
  return true;
  
  // Future implementation example:
  // const captchaService = config.captcha?.service; // '2captcha', 'anticaptcha', etc.
  // const apiKey = config.captcha?.apiKey;
  // 
  // if (!captchaService || !apiKey) {
  //   await handleCaptchaManually(page, config);
  //   return true;
  // }
  // 
  // try {
  //   // Extract CAPTCHA site key
  //   const siteKey = await page.evaluate(() => {
  //     const recaptcha = document.querySelector('.g-recaptcha');
  //     return recaptcha ? recaptcha.getAttribute('data-sitekey') : null;
  //   });
  //   
  //   if (!siteKey) {
  //     throw new Error('Could not extract CAPTCHA site key');
  //   }
  //   
  //   // Send to solving service
  //   const solution = await solveCaptcha(captchaService, apiKey, siteKey, page.url());
  //   
  //   // Inject solution
  //   await page.evaluate((token) => {
  //     document.getElementById('g-recaptcha-response').innerHTML = token;
  //   }, solution);
  //   
  //   console.log('✅ CAPTCHA solved using third-party service\n');
  //   return true;
  // } catch (error) {
  //   console.error('❌ Third-party CAPTCHA solving failed:', error.message);
  //   console.log('Falling back to manual handling...\n');
  //   await handleCaptchaManually(page, config);
  //   return true;
  // }
}

/**
 * Check and handle CAPTCHA if present (only call after page navigation/load)
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @param {string} expectedSelector - Selector to wait for after CAPTCHA is solved (optional)
 */
async function checkAndHandleCaptcha(page, config, expectedSelector = null) {
  const hasCaptcha = await detectCaptcha(page);
  
  if (hasCaptcha) {
    const captchaMode = config.captcha?.mode || 'manual'; // 'manual' or 'service'
    
    if (captchaMode === 'service') {
      await handleCaptchaWithService(page, config);
    } else {
      await handleCaptchaManually(page, config);
    }
    
    // Wait for expected element to appear after CAPTCHA is solved
    if (expectedSelector) {
      console.log(`Waiting for expected element: ${expectedSelector}...`);
      await page.waitForSelector(expectedSelector, { timeout: 60000 });
      console.log('✅ Expected element is now visible\n');
    }
  } else {
    console.log('✅ No CAPTCHA detected, proceeding...\n');
  }
}

// ============================================================================
// LOGIN FLOW
// ============================================================================

/**
 * Login to DVSA website with credentials
 * @param {Page} page - Puppeteer page object
 * @param {Object} credentials - Login credentials
 * @param {Object} config - Configuration object
 */
export async function login(page, credentials, config) {
  console.log('\n=== MODULE 1: LOGIN FLOW ===\n');
  
  try {
    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to DVSA login page...');
    await page.goto(DVSA_LOGIN_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    console.log('✅ Page navigation completed\n');
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Step 2: Verify login page loaded correctly by checking for login form ID
    console.log('Step 2: Verifying login page loaded correctly...');
    try {
      await page.waitForSelector('#driving-licence-number', { timeout: 10000 });
      console.log('✅ Login page verified (found #driving-licence-number)\n');
    } catch (error) {
      console.log('❌ Login page did not load correctly - login form not found\n');
      
      // Take screenshot for debugging
      let screenshotPath = null;
      try {
        const { takeScreenshot } = await import('../utils/screenshot.js');
        screenshotPath = await takeScreenshot(page, 'wrong-page-loaded');
      } catch (screenshotError) {
        console.log('⚠️  Could not take screenshot:', screenshotError.message);
      }
      
      // Get page content for debugging
      const pageUrl = page.url();
      const pageTitle = await page.title();
      
      console.log('📋 Page Information:');
      console.log(`   URL: ${pageUrl}`);
      console.log(`   Title: ${pageTitle}\n`);
      
      const errorMsg = `Wrong page loaded - expected login page but got: ${pageTitle} (${pageUrl})`;
      if (screenshotPath) {
        throw new Error(`${errorMsg}|||${screenshotPath}`);
      } else {
        throw new Error(errorMsg);
      }
    }
    
    // Check for security block after initial page load
    await checkSecurityBlockAfterAction(page, 'initial page load');
    
    // Step 3: Check for maintenance mode
    console.log('Step 3: Checking for maintenance mode...');
    const maintenanceCheck = await detectMaintenanceMode(page);
    if (maintenanceCheck.isMaintenance) {
      let screenshotPath = null;
      try {
        const { takeScreenshot } = await import('../utils/screenshot.js');
        screenshotPath = await takeScreenshot(page, 'maintenance');
      } catch (screenshotError) {
        console.log('⚠️  Could not take maintenance screenshot:', screenshotError.message);
      }
      
      if (screenshotPath) {
        throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}|||${screenshotPath}`);
      } else {
        throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}`);
      }
    }
    console.log('✅ No maintenance mode detected\n');
    
    // Step 4: Check and handle CAPTCHA (only after page load)
    console.log('Step 4: Checking for CAPTCHA after page load...');
    await checkAndHandleCaptcha(page, config, '#driving-licence-number');
    
    // Step 5: Verify all login form elements are present
    console.log('Step 5: Verifying all login form elements...');
    await page.waitForSelector('#application-reference-number', { timeout: 5000 });
    await page.waitForSelector('#booking-login', { timeout: 5000 });
    console.log('✅ All login form elements verified\n');
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Step 6: Fill driving licence number
    console.log('Step 6: Entering driving licence number...');
    await typeWithDelay(page, '#driving-licence-number', credentials.licenseNumber, config);
    console.log(`✅ Entered: ${credentials.licenseNumber}\n`);
    await randomDelay(config.delays.typing.min, config.delays.typing.max);
    
    // Step 7: Fill booking reference
    console.log('Step 7: Entering booking reference...');
    await typeWithDelay(page, '#application-reference-number', credentials.bookingReference, config);
    console.log(`✅ Entered: ${credentials.bookingReference}\n`);
    await randomDelay(config.delays.typing.min, config.delays.typing.max);
    
    // Step 8: Submit login form
    console.log('Step 8: Submitting login form...');
    await clickWithDelay(page, '#booking-login', config);
    
    // Wait for navigation to booking details page
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Navigation completed after login\n');
    await randomDelay(config.delays.navigation.min, config.delays.navigation.max);
    
    // Check for security block after login submission
    await checkSecurityBlockAfterAction(page, 'login submission');
    
    // Step 9: Verify booking details page loaded correctly
    console.log('Step 9: Verifying booking details page loaded correctly...');
    try {
      // Wait for the booking details page container
      await page.waitForSelector('#page-ibs-summary', { timeout: 10000 });
      console.log('✅ Booking details page verified (found #page-ibs-summary)\n');
      await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    } catch (error) {
      console.log('❌ Booking details page did not load correctly\n');
      
      // Take screenshot for debugging
      let screenshotPath = null;
      try {
        const { takeScreenshot } = await import('../utils/screenshot.js');
        screenshotPath = await takeScreenshot(page, 'wrong-page-after-login');
      } catch (screenshotError) {
        console.log('⚠️  Could not take screenshot:', screenshotError.message);
      }
      
      // Get page content for debugging
      const pageUrl = page.url();
      const pageTitle = await page.title();
      
      console.log('📋 Page Information:');
      console.log(`   URL: ${pageUrl}`);
      console.log(`   Title: ${pageTitle}\n`);
      
      const errorMsg = `Wrong page loaded after login - expected booking details page but got: ${pageTitle} (${pageUrl})`;
      if (screenshotPath) {
        throw new Error(`${errorMsg}|||${screenshotPath}`);
      } else {
        throw new Error(errorMsg);
      }
    }
    
    console.log('=== MODULE 1 COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error in login flow:', error.message);
    
    // Take error screenshot
    try {
      const { takeScreenshot } = await import('../utils/screenshot.js');
      await takeScreenshot(page, 'login-error');
    } catch (screenshotError) {
      console.log('⚠️  Could not take error screenshot:', screenshotError.message);
    }
    
    throw error;
  }
}

export async function checkAvailability(page, config) {
  console.log('Checking test centre availability...');
  
  // Navigate to change test centre page
  await randomDelay(config.delays.clicking.min, config.delays.clicking.max);
  
  // This is a placeholder - actual selectors depend on DVSA website structure
  try {
    await page.waitForSelector('.test-centre-list', { timeout: 10000 });
    
    const centreData = await page.evaluate(() => {
      const centres = [];
      const centreElements = document.querySelectorAll('.test-centre-item');
      
      centreElements.forEach(element => {
        const name = element.querySelector('.centre-name')?.textContent.trim();
        const dates = Array.from(element.querySelectorAll('.available-date'))
          .map(d => d.textContent.trim());
        
        if (name && dates.length > 0) {
          centres.push({ name, dates, available: true });
        }
      });
      
      return centres;
    });
    
    return centreData;
  } catch (error) {
    console.error('Error checking availability:', error.message);
    return [];
  }
}

// ============================================================================
// MODULE 2: BOOKING DETAILS PAGE NAVIGATION
// ============================================================================

/**
 * Navigate to the change test centre page after login
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 */
export async function navigateToChangeCentre(page, config) {
  console.log('\n=== MODULE 2: BOOKING DETAILS PAGE NAVIGATION ===\n');
  
  try {
    // Step 1: Verify we're on the booking details page
    console.log('Step 1: Verifying booking details page...');
    await page.waitForSelector('#page-ibs-summary', { timeout: 10000 });
    await page.waitForSelector('#confirm-booking-details', { timeout: 5000 });
    console.log('✅ Booking details page verified\n');
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Step 2: Extract booking information (optional, for logging)
    console.log('Step 2: Extracting booking information...');
    try {
      const bookingInfo = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : 'N/A';
        };
        
        return {
          drivingLicence: getText('#header-title').match(/[A-Z0-9]{16}/)?.[0] || 'N/A',
          url: window.location.href
        };
      });
      
      console.log(`   Driving Licence: ${bookingInfo.drivingLicence}`);
      console.log(`   URL: ${bookingInfo.url}\n`);
    } catch (extractError) {
      console.log('⚠️  Could not extract booking info (non-critical)\n');
    }
    
    // Step 3: Locate and click "Change test centre" button
    console.log('Step 3: Looking for "Change test centre" button...');
    await page.waitForSelector('#test-centre-change', { timeout: 10000 });
    console.log('✅ Found "Change" button (#test-centre-change)\n');
    await randomDelay(config.delays.clicking.min, config.delays.clicking.max);
    
    console.log('Step 4: Clicking "Change test centre" button...');
    await clickWithDelay(page, '#test-centre-change', config);
    
    // Wait for navigation to test centre search page
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Navigation completed\n');
    await randomDelay(config.delays.navigation.min, config.delays.navigation.max);
    
    // Check for security block after navigation
    await checkSecurityBlockAfterAction(page, 'clicking "Change test centre" button');
    
    // Step 5: Verify test centre search page loaded correctly
    console.log('Step 5: Verifying test centre search page loaded correctly...');
    try {
      await page.waitForSelector('#page-test-centre-search', { timeout: 10000 });
      console.log('✅ Test centre search page verified (found #page-test-centre-search)\n');
    } catch (error) {
      console.log('❌ Test centre search page did not load correctly\n');
      
      // Take screenshot for debugging
      let screenshotPath = null;
      try {
        const { takeScreenshot } = await import('../utils/screenshot.js');
        screenshotPath = await takeScreenshot(page, 'wrong-page-after-change-centre');
      } catch (screenshotError) {
        console.log('⚠️  Could not take screenshot:', screenshotError.message);
      }
      
      const pageUrl = page.url();
      const pageTitle = await page.title();
      
      console.log('📋 Page Information:');
      console.log(`   URL: ${pageUrl}`);
      console.log(`   Title: ${pageTitle}\n`);
      
      const errorMsg = `Wrong page loaded - expected test centre search page but got: ${pageTitle} (${pageUrl})`;
      if (screenshotPath) {
        throw new Error(`${errorMsg}|||${screenshotPath}`);
      } else {
        throw new Error(errorMsg);
      }
    }
    
    // Step 6: Check for CAPTCHA after page load
    console.log('Step 6: Checking for CAPTCHA after navigation...');
    await checkAndHandleCaptcha(page, config, '#page-test-centre-search');
    
    // Step 7: Verify search form elements are present
    console.log('Step 7: Verifying search form elements...');
    await page.waitForSelector('#test-centres-input', { timeout: 10000 });
    await page.waitForSelector('#test-centres-submit', { timeout: 5000 });
    console.log('✅ Search form elements verified\n');
    
    console.log('=== MODULE 2 COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error navigating to change centre page:', error.message);
    
    // Take error screenshot
    try {
      const { takeScreenshot } = await import('../utils/screenshot.js');
      await takeScreenshot(page, 'navigate-change-centre-error');
    } catch (screenshotError) {
      console.log('⚠️  Could not take error screenshot:', screenshotError.message);
    }
    
    throw error;
  }
}

// ============================================================================
// MODULE 3: TEST CENTRE SEARCH (POSTCODE ENTRY)
// ============================================================================

/**
 * Search for test centres by postcode
 * @param {Page} page - Puppeteer page object
 * @param {string} postcode - UK postcode to search
 * @param {Object} config - Configuration object
 */
export async function searchByPostcode(page, postcode, config) {
  console.log('\n=== MODULE 3: TEST CENTRE SEARCH ===\n');
  console.log(`Searching for test centres near postcode: ${postcode}\n`);
  
  try {
    // Step 1: Verify we're on the test centre search page
    console.log('Step 1: Verifying test centre search page...');
    await page.waitForSelector('#page-test-centre-search', { timeout: 10000 });
    await page.waitForSelector('#test-centres-input', { timeout: 5000 });
    await page.waitForSelector('#test-centres-submit', { timeout: 5000 });
    console.log('✅ Test centre search page verified\n');
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Step 2: Enter postcode in the search field
    console.log(`Step 2: Entering postcode "${postcode}"...`);
    await typeWithDelay(page, '#test-centres-input', postcode, config);
    
    // Verify the entered value
    const enteredValue = await page.$eval('#test-centres-input', el => el.value);
    console.log(`✅ Entered: ${enteredValue}\n`);
    await randomDelay(config.delays.typing.min, config.delays.typing.max);
    
    // Step 3: Click "Find test centres" button
    console.log('Step 3: Clicking "Find test centres" button...');
    await clickWithDelay(page, '#test-centres-submit', config);
    
    // Wait for search results page to load
    console.log('Waiting for search results to load...');
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Step 4: Verify search results page loaded correctly
    console.log('Step 4: Verifying search results page loaded correctly...');
    try {
      await page.waitForSelector('#search-results', { timeout: 15000 });
      console.log('✅ Search results page verified (found #search-results)\n');
    } catch (error) {
      console.log('❌ Search results page did not load correctly\n');
      
      // Take screenshot for debugging
      let screenshotPath = null;
      try {
        const { takeScreenshot } = await import('../utils/screenshot.js');
        screenshotPath = await takeScreenshot(page, 'wrong-page-after-search');
      } catch (screenshotError) {
        console.log('⚠️  Could not take screenshot:', screenshotError.message);
      }
      
      const pageUrl = page.url();
      const pageTitle = await page.title();
      
      console.log('📋 Page Information:');
      console.log(`   URL: ${pageUrl}`);
      console.log(`   Title: ${pageTitle}\n`);
      
      const errorMsg = `Wrong page loaded after search - expected results page but got: ${pageTitle} (${pageUrl})`;
      if (screenshotPath) {
        throw new Error(`${errorMsg}|||${screenshotPath}`);
      } else {
        throw new Error(errorMsg);
      }
    }
    
    // Check for security block after search
    await checkSecurityBlockAfterAction(page, 'postcode search submission');
    
    // Step 5: Check for CAPTCHA after results load
    console.log('Step 5: Checking for CAPTCHA after search...');
    await checkAndHandleCaptcha(page, config, '#search-results');
    
    // Step 6: Verify results are present
    console.log('Step 6: Verifying search results...');
    const hasResults = await page.evaluate(() => {
      const results = document.querySelectorAll('[id^="centre-name-"]');
      return results.length > 0;
    });
    
    if (hasResults) {
      const resultCount = await page.evaluate(() => {
        return document.querySelectorAll('[id^="centre-name-"]').length;
      });
      console.log(`✅ Found ${resultCount} test centre(s) in initial results\n`);
    } else {
      console.log('⚠️  No test centres found for this postcode\n');
    }
    
    console.log('=== MODULE 3 COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error searching by postcode:', error.message);
    
    // Take error screenshot
    try {
      const { takeScreenshot } = await import('../utils/screenshot.js');
      await takeScreenshot(page, 'search-postcode-error');
    } catch (screenshotError) {
      console.log('⚠️  Could not take error screenshot:', screenshotError.message);
    }
    
    throw error;
  }
}

// ============================================================================
// MODULE 4: RESULTS EXTRACTION & PAGINATION
// ============================================================================

/**
 * Extract test centre details from the current page
 * Uses the correct selector from DVSA website: [id^="centre-name-"]
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Array>} Array of test centre objects
 */
export async function extractCentreDetails(page) {
  console.log('Extracting test centre details...');
  
  try {
    const centres = await page.evaluate(() => {
      const results = [];
      
      // Use the correct selector: all links with IDs starting with "centre-name-"
      const centreLinks = document.querySelectorAll('[id^="centre-name-"]');
      
      centreLinks.forEach(link => {
        try {
          const text = link.textContent.trim();
          const centreId = link.id.replace('centre-name-', '');
          
          // Parse format: "Centre Name – Status"
          // Split by "–" (en dash) or "-" (hyphen)
          const parts = text.split(/[–-]/);
          
          let centreName = '';
          let status = 'Unknown';
          
          if (parts.length >= 2) {
            // Last part is status, everything before is centre name
            centreName = parts.slice(0, -1).join('–').trim();
            status = parts[parts.length - 1].trim();
          } else {
            // No status separator found, use entire text as name
            centreName = text;
          }
          
          // Determine availability from status
          let availability = 'unknown';
          const statusLower = status.toLowerCase();
          
          if (statusLower.includes('available') && !statusLower.includes('not')) {
            availability = 'available';
          } else if (statusLower.includes('not available') || 
                     statusLower.includes('unavailable') ||
                     statusLower.includes('no tests')) {
            availability = 'not_available';
          }
          
          if (centreName) {
            results.push({
              name: centreName,
              address: '', // Address not available in link text
              postcode: '', // Will be filled by caller if needed
              availability,
              status, // Keep original status text
              centreId,
              dateCollected: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error extracting centre data from link:', err);
        }
      });
      
      return results;
    });
    
    console.log(`✅ Extracted ${centres.length} test centre(s)`);
    return centres;
  } catch (error) {
    console.error('❌ Error extracting centre details:', error.message);
    return [];
  }
}

/**
 * Load more results by clicking the "Show more results" button
 * Uses AJAX loading (no navigation), waits 3 seconds for results to load
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>} True if more results were loaded, false if button not found
 */
export async function loadMoreResults(page, config) {
  try {
    // Check if "Show more results" button exists
    const moreButton = await page.$('#fetch-more-centres');
    
    if (!moreButton) {
      console.log('ℹ️  No "Show more results" button found');
      return false;
    }
    
    // Check if button is visible
    const isVisible = await page.evaluate((btn) => {
      const rect = btn.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    }, moreButton);
    
    if (!isVisible) {
      console.log('ℹ️  "Show more results" button exists but is not visible');
      return false;
    }
    
    console.log('ℹ️  "Show more results" button found');
    
    // Get current count before loading more
    const countBefore = await page.evaluate(() => {
      return document.querySelectorAll('[id^="centre-name-"]').length;
    });
    
    // Scroll to button with smooth scrolling
    await page.evaluate((btn) => {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, moreButton);
    
    await randomDelay(0.5, 1.5);
    
    // Click button using clickWithDelay
    console.log('Clicking "Show more results" button...');
    await clickWithDelay(page, '#fetch-more-centres', config);
    
    // Wait for AJAX to complete (3 seconds as per temp.js)
    console.log('Waiting for AJAX to load more results...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for security block after loading more results
    await checkSecurityBlockAfterAction(page, 'clicking "Show more results" button');
    
    // Check for CAPTCHA after clicking (may appear randomly)
    console.log('Checking for CAPTCHA after loading more results...');
    await checkAndHandleCaptcha(page, config, '#search-results');
    
    // Verify new results loaded
    const countAfter = await page.evaluate(() => {
      return document.querySelectorAll('[id^="centre-name-"]').length;
    });
    
    if (countAfter > countBefore) {
      const newCount = countAfter - countBefore;
      console.log(`✅ Loaded ${newCount} more centre(s) (total: ${countAfter})\n`);
      return true;
    } else {
      console.log('⚠️  No new results loaded (may have reached end)\n');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error loading more results:', error.message);
    return false;
  }
}

/**
 * Detect if new centres are duplicates of existing centres
 * @param {Array} newCentres - Newly extracted centres
 * @param {Array} existingCentres - Previously collected centres
 * @returns {boolean} True if duplicates exceed threshold (3 consecutive)
 */
export function detectDuplicates(newCentres, existingCentres) {
  if (!newCentres || newCentres.length === 0) {
    return false;
  }
  
  if (!existingCentres || existingCentres.length === 0) {
    return false;
  }
  
  // Normalize function for comparison
  const normalize = (str) => {
    return str.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
  };
  
  let duplicateCount = 0;
  const threshold = 3;
  
  for (const newCentre of newCentres) {
    const normalizedNewName = normalize(newCentre.name);
    const normalizedNewAddress = normalize(newCentre.address);
    
    const isDuplicate = existingCentres.some(existing => {
      const normalizedExistingName = normalize(existing.name);
      const normalizedExistingAddress = normalize(existing.address);
      
      // Match by name and address
      return normalizedNewName === normalizedExistingName &&
             normalizedNewAddress === normalizedExistingAddress;
    });
    
    if (isDuplicate) {
      duplicateCount++;
      if (duplicateCount >= threshold) {
        console.log(`Found ${duplicateCount} consecutive duplicates, threshold reached`);
        return true;
      }
    } else {
      // Reset counter if we find a non-duplicate
      duplicateCount = 0;
    }
  }
  
  return false;
}

/**
 * Detect if the website is in maintenance mode
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} Object with { isMaintenance: boolean, message: string }
 */
export async function detectMaintenanceMode(page) {
  try {
    // Common maintenance message patterns
    const maintenancePatterns = [
      'sorry',
      "i'll be back",
      'be back at',
      'maintenance',
      'temporarily unavailable',
      'service unavailable',
      'under maintenance',
      'scheduled maintenance',
      'system maintenance',
      'currently unavailable'
    ];
    
    // Get page text content
    const pageText = await page.evaluate(() => document.body.textContent.toLowerCase());
    
    // Check for maintenance patterns
    for (const pattern of maintenancePatterns) {
      if (pageText.includes(pattern)) {
        // Try to extract the full maintenance message
        const fullMessage = await page.evaluate(() => {
          // Look for common maintenance message containers
          const selectors = [
            'h1', 'h2', '.error-message', '.maintenance-message',
            '.notice', '.alert', '.warning', 'main', '.content'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              const text = el.textContent.trim();
              if (text.toLowerCase().includes('sorry') || 
                  text.toLowerCase().includes('be back') ||
                  text.toLowerCase().includes('maintenance')) {
                return text;
              }
            }
          }
          
          return document.body.textContent.trim().substring(0, 200);
        });
        
        console.log(`🛑 Maintenance mode detected: ${fullMessage}`);
        return {
          isMaintenance: true,
          message: fullMessage || 'The service is temporarily unavailable'
        };
      }
    }
    
    return { isMaintenance: false, message: '' };
  } catch (error) {
    console.error('Error detecting maintenance mode:', error.message);
    return { isMaintenance: false, message: '' };
  }
}

/**
 * Detect if a verification challenge (CAPTCHA) is present
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} True if challenge detected, false otherwise
 */
export async function detectVerificationChallenge(page) {
  try {
    // Common CAPTCHA and verification selectors
    const challengeSelectors = [
      '#recaptcha',
      '.g-recaptcha',
      '.recaptcha',
      'iframe[src*="recaptcha"]',
      'iframe[src*="captcha"]',
      '.captcha',
      '#captcha',
      '[data-captcha]',
      '.hcaptcha',
      '#hcaptcha'
    ];
    
    // Check for verification text
    const verificationTexts = [
      'verify you are human',
      'complete the captcha',
      'security check',
      'prove you are not a robot',
      'verification required'
    ];
    
    // Check for CAPTCHA elements
    for (const selector of challengeSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`Verification challenge detected: ${selector}`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Check for verification text in page content
    const pageText = await page.evaluate(() => document.body.textContent.toLowerCase());
    for (const text of verificationTexts) {
      if (pageText.includes(text)) {
        console.log(`Verification challenge detected: "${text}"`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting verification challenge:', error.message);
    return false;
  }
}

/**
 * Handle verification challenge by pausing for manual intervention
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @param {string} mode - 'monitoring' or 'collection'
 */
export async function handleVerificationPause(page, config, mode = 'monitoring') {
  const timeout = config.collection?.verificationTimeout || 60;
  
  console.log('\n' + '='.repeat(60));
  console.log('🔒 VERIFICATION CHALLENGE DETECTED 🔒');
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  A CAPTCHA or verification challenge has been detected.');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('   1. The browser window should be visible');
  console.log('   2. Please complete the verification manually');
  console.log('   3. Do NOT close the browser window');
  console.log('   4. Automation will resume automatically');
  console.log('');
  console.log(`⏱️  Waiting for ${timeout} seconds...`);
  console.log('='.repeat(60));
  console.log('');
  
  // Take screenshot of verification challenge
  let screenshotPath = null;
  try {
    const { takeScreenshot } = await import('../utils/screenshot.js');
    screenshotPath = await takeScreenshot(page, 'verification');
  } catch (error) {
    console.log('⚠️  Could not take screenshot:', error.message);
  }
  
  // Send email notification about verification challenge
  try {
    const { sendVerificationAlert } = await import('../utils/email.js');
    await sendVerificationAlert(mode, screenshotPath);
  } catch (error) {
    console.log('⚠️  Could not send verification email alert:', error.message);
  }
  
  // Display countdown
  const startTime = Date.now();
  const endTime = startTime + (timeout * 1000);
  
  while (Date.now() < endTime) {
    const remaining = Math.ceil((endTime - Date.now()) / 1000);
    process.stdout.write(`\r⏳ Time remaining: ${remaining} seconds...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n');
  console.log('✅ Resuming automation...');
  console.log('='.repeat(60));
  console.log('');
}
