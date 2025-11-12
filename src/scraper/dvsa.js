import { randomDelay, typeWithDelay, clickWithDelay } from '../utils/delay.js';

const DVSA_URL = 'https://www.gov.uk/change-driving-test';

export async function login(page, credentials, config) {
  console.log('Navigating to change driving test page...');
  try {
    await page.goto(DVSA_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    console.log('Page loaded successfully');
  } catch (error) {
    console.error('Navigation error:', error.message);
    throw error;
  }
  await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);

  console.log('Clicking "Start now" button...');
  await clickWithDelay(page, '.govuk-button--start', config);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
  
  // Check for maintenance mode after clicking "Start now"
  const maintenanceCheck = await detectMaintenanceMode(page);
  if (maintenanceCheck.isMaintenance) {
    // Take screenshot of maintenance page
    let screenshotPath = null;
    try {
      const { takeScreenshot } = await import('../utils/screenshot.js');
      screenshotPath = await takeScreenshot(page, 'maintenance');
    } catch (screenshotError) {
      console.log('⚠️  Could not take maintenance screenshot:', screenshotError.message);
    }
    
    // Throw maintenance error with or without screenshot
    if (screenshotPath) {
      throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}|||${screenshotPath}`);
    } else {
      throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}`);
    }
  }

  console.log('Entering driving licence number...');
  await typeWithDelay(page, '#driving-licence-number', credentials.licenseNumber, config);
  await randomDelay(config.delays.typing.min, config.delays.typing.max);
  
  console.log('Entering booking reference...');
  await typeWithDelay(page, '#application-reference-number', credentials.bookingReference, config);
  await randomDelay(config.delays.typing.min, config.delays.typing.max);

  console.log('Submitting login form...');
  await clickWithDelay(page, 'button[type="submit"]', config);
  
  // Wait for potential manual intervention (CAPTCHA, verification, etc.)
  console.log('\n⚠️  Waiting for potential manual intervention (CAPTCHA/verification)...');
  console.log('If required, please complete it manually. Waiting 30 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await randomDelay(config.delays.navigation.min, config.delays.navigation.max);
  console.log('Continuing automation...');
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

/**
 * Navigate to the change test centre page after login
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 */
export async function navigateToChangeCentre(page, config) {
  console.log('Navigating to change test centre page...');
  
  try {
    // Wait for booking details page to load after login
    await page.waitForSelector('body', { timeout: 10000 });
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    // Locate "Change test centre" button or link
    // Common selectors for DVSA website
    const changeCentreSelectors = [
      'a[href*="change-test-centre"]',
      'a:contains("Change test centre")',
      '.change-test-centre',
      'button:contains("Change test centre")'
    ];
    
    let clicked = false;
    for (const selector of changeCentreSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found change centre button with selector: ${selector}`);
        await clickWithDelay(page, selector, config);
        clicked = true;
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find "Change test centre" button');
    }
    
    // Wait for postcode search page to load
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(config.delays.navigation.min, config.delays.navigation.max);
    
    console.log('Successfully navigated to postcode search page');
  } catch (error) {
    console.error('Error navigating to change centre page:', error.message);
    throw error;
  }
}

/**
 * Search for test centres by postcode
 * @param {Page} page - Puppeteer page object
 * @param {string} postcode - UK postcode to search
 * @param {Object} config - Configuration object
 */
export async function searchByPostcode(page, postcode, config) {
  console.log(`Searching for test centres near postcode: ${postcode}`);
  
  try {
    // Locate postcode input field - common selectors
    const postcodeInputSelectors = [
      '#postcode',
      'input[name="postcode"]',
      'input[type="text"][placeholder*="postcode"]',
      '.postcode-input'
    ];
    
    let inputSelector = null;
    for (const selector of postcodeInputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        inputSelector = selector;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inputSelector) {
      throw new Error('Could not find postcode input field');
    }
    
    // Use typeWithDelay to enter postcode character-by-character
    await typeWithDelay(page, inputSelector, postcode, config);
    await randomDelay(config.delays.typing.min, config.delays.typing.max);
    
    // Locate and click search/submit button
    const searchButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Search")',
      '.search-button',
      '#search-button'
    ];
    
    let buttonSelector = null;
    for (const selector of searchButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        buttonSelector = selector;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!buttonSelector) {
      throw new Error('Could not find search button');
    }
    
    await clickWithDelay(page, buttonSelector, config);
    
    // Wait for search results to load
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    console.log('Search results loaded successfully');
  } catch (error) {
    console.error('Error searching by postcode:', error.message);
    throw error;
  }
}

/**
 * Extract test centre details from the current page
 * @param {Page} page - Puppeteer page object
 * @returns {Array} Array of test centre objects
 */
export async function extractCentreDetails(page) {
  console.log('Extracting test centre details...');
  
  try {
    const centres = await page.evaluate(() => {
      const results = [];
      
      // Common selectors for test centre results
      const centreSelectors = [
        '.test-centre',
        '.test-centre-item',
        '.centre-result',
        '[data-test-centre]',
        '.search-result'
      ];
      
      let centreElements = [];
      for (const selector of centreSelectors) {
        centreElements = document.querySelectorAll(selector);
        if (centreElements.length > 0) break;
      }
      
      centreElements.forEach(element => {
        try {
          // Extract centre name
          const nameSelectors = ['.centre-name', '.name', 'h2', 'h3', '.title'];
          let name = '';
          for (const selector of nameSelectors) {
            const nameEl = element.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              break;
            }
          }
          
          // Extract address
          const addressSelectors = ['.address', '.location', '.centre-address', 'address'];
          let address = '';
          for (const selector of addressSelectors) {
            const addressEl = element.querySelector(selector);
            if (addressEl && addressEl.textContent.trim()) {
              address = addressEl.textContent.trim();
              break;
            }
          }
          
          // Extract availability status
          const availabilitySelectors = [
            '.availability',
            '.status',
            '[data-availability]',
            '.available',
            '.not-available'
          ];
          let availability = 'unknown';
          for (const selector of availabilitySelectors) {
            const availEl = element.querySelector(selector);
            if (availEl) {
              const text = availEl.textContent.toLowerCase();
              if (text.includes('available') && !text.includes('not')) {
                availability = 'available';
              } else if (text.includes('not available') || text.includes('unavailable')) {
                availability = 'not_available';
              }
              break;
            }
          }
          
          // Check for availability indicators in the element itself
          const elementText = element.textContent.toLowerCase();
          if (availability === 'unknown') {
            if (elementText.includes('slots available') || elementText.includes('appointments available')) {
              availability = 'available';
            } else if (elementText.includes('no slots') || elementText.includes('fully booked')) {
              availability = 'not_available';
            }
          }
          
          if (name) {
            results.push({
              name,
              address: address || 'Address not found',
              postcode: '', // Will be filled by caller if needed
              availability,
              dateCollected: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error extracting centre data:', err);
        }
      });
      
      return results;
    });
    
    console.log(`Extracted ${centres.length} test centres`);
    return centres;
  } catch (error) {
    console.error('Error extracting centre details:', error.message);
    return [];
  }
}

/**
 * Load more results by clicking the "Load more" button
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @returns {boolean} True if more results were loaded, false if button not found
 */
export async function loadMoreResults(page, config) {
  try {
    // Check if "Load more results" button exists
    const loadMoreSelectors = [
      'button:contains("Load more")',
      'a:contains("Load more")',
      '.load-more',
      '#load-more',
      'button[data-load-more]',
      '.show-more',
      'button:contains("Show more")'
    ];
    
    let buttonSelector = null;
    for (const selector of loadMoreSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          buttonSelector = selector;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!buttonSelector) {
      console.log('No "Load more" button found');
      return false;
    }
    
    // Scroll to button with random scrolling behavior
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, buttonSelector);
    
    await randomDelay(0.5, 1.5);
    
    // Click button using clickWithDelay
    console.log('Clicking "Load more" button...');
    await clickWithDelay(page, buttonSelector, config);
    
    // Wait for new results to load
    await randomDelay(config.delays.pageLoad.min, config.delays.pageLoad.max);
    
    console.log('More results loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading more results:', error.message);
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
