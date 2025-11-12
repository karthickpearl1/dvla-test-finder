/**
 * Test Centre Collector Module
 * Orchestrates the collection of test centres across multiple UK postcodes
 */

import { initBrowser, closeBrowser } from './scraper/browser.js';
import { 
  login, 
  navigateToChangeCentre, 
  searchByPostcode, 
  extractCentreDetails,
  loadMoreResults,
  detectDuplicates,
  detectVerificationChallenge,
  handleVerificationPause,
  detectMaintenanceMode
} from './scraper/dvsa.js';
import { 
  initializeCsv, 
  readCentresFromCsv, 
  appendCentreToCsv, 
  isDuplicateCentre 
} from './utils/csv.js';
import { getNextPostcode, getPostcodeCount } from './utils/postcodes.js';
import { notifyAvailability, hasBeenNotified } from './utils/notifier.js';
import { loadConfig } from './utils/config.js';
import { randomDelay } from './utils/delay.js';

export { runCollection };

/**
 * Collect test centres for a single postcode
 * Handles "Load more" functionality and duplicate detection
 * @param {Page} page - Puppeteer page object
 * @param {string} postcode - UK postcode to search
 * @param {Array} existingCentres - Previously collected centres
 * @param {Object} config - Configuration object
 * @returns {Array} Array of all collected centres for this postcode
 */
async function collectCentresForPostcode(page, postcode, existingCentres, config) {
  const allCentres = [];
  let duplicateCounter = 0;
  const duplicateThreshold = config.collection?.duplicateThreshold || 3;
  const maxLoadMoreClicks = config.collection?.maxLoadMoreClicks || 20;
  let loadMoreClicks = 0;

  try {
    // Search by postcode
    await searchByPostcode(page, postcode, config);

    // Extract initial visible centres
    let centres = await extractCentreDetails(page);
    
    // Add postcode to each centre
    centres = centres.map(centre => ({
      ...centre,
      postcode: postcode
    }));

    // Check each centre for availability and notify if found
    for (const centre of centres) {
      if (centre.availability === 'available' && !hasBeenNotified(centre)) {
        await notifyAvailability(centre, page);
      }
    }

    allCentres.push(...centres);
    console.log(`✓ Extracted ${centres.length} centres from initial results`);

    // While "Load more" exists and duplicates below threshold
    while (loadMoreClicks < maxLoadMoreClicks && duplicateCounter < duplicateThreshold) {
      // Check for verification challenge
      const hasChallenge = await detectVerificationChallenge(page);
      if (hasChallenge) {
        await handleVerificationPause(page, config, 'collection');
      }

      // Try to load more results
      const moreLoaded = await loadMoreResults(page, config);
      
      if (!moreLoaded) {
        console.log('No more results to load');
        break;
      }

      loadMoreClicks++;

      // Extract new centres
      const newCentres = await extractCentreDetails(page);
      
      // Add postcode to each centre
      const newCentresWithPostcode = newCentres.map(centre => ({
        ...centre,
        postcode: postcode
      }));

      // Check for availability and notify
      for (const centre of newCentresWithPostcode) {
        if (centre.availability === 'available' && !hasBeenNotified(centre)) {
          await notifyAvailability(centre, page);
        }
      }

      // Detect duplicates in new batch
      const hasDuplicates = detectDuplicates(newCentresWithPostcode, [...allCentres, ...existingCentres]);
      
      if (hasDuplicates) {
        duplicateCounter++;
        console.log(`⚠️  Duplicate batch detected (${duplicateCounter}/${duplicateThreshold})`);
      } else {
        // Reset counter if we find unique centres
        duplicateCounter = 0;
      }

      allCentres.push(...newCentresWithPostcode);
      console.log(`✓ Extracted ${newCentresWithPostcode.length} centres (total: ${allCentres.length})`);
    }

    if (duplicateCounter >= duplicateThreshold) {
      console.log(`✓ Stopped loading more results: duplicate threshold reached`);
    } else if (loadMoreClicks >= maxLoadMoreClicks) {
      console.log(`✓ Stopped loading more results: max clicks limit reached`);
    }

    return allCentres;
  } catch (error) {
    console.error(`Error collecting centres for postcode ${postcode}:`, error.message);
    return allCentres; // Return what we collected so far
  }
}

/**
 * Process all UK postcodes to collect test centres
 * Uses geographic distribution strategy to maximize coverage
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Configuration object
 * @returns {Object} Collection statistics
 */
async function processAllPostcodes(page, config) {
  const csvFilePath = config.collection?.csvFilePath || 'test-centres.csv';
  const totalPostcodes = getPostcodeCount();
  
  // Initialize CSV file
  initializeCsv(csvFilePath);
  
  // Load existing centres from CSV into memory
  let existingCentres = readCentresFromCsv(csvFilePath);
  console.log(`✓ Loaded ${existingCentres.length} existing centres from CSV`);
  
  // Initialize used postcodes array
  const usedPostcodes = [];
  let totalNewCentres = 0;
  let totalCentresCollected = 0;

  // While postcodes remain
  while (usedPostcodes.length < totalPostcodes) {
    // Get next geographically distant postcode
    const nextPostcode = getNextPostcode(usedPostcodes);
    
    if (!nextPostcode) {
      console.log('✓ All postcodes have been processed');
      break;
    }

    // Display current progress
    console.log('\n' + '='.repeat(60));
    console.log(`📍 Processing postcode ${usedPostcodes.length + 1} of ${totalPostcodes}: ${nextPostcode}`);
    console.log('='.repeat(60));

    try {
      // Collect centres for postcode
      const centres = await collectCentresForPostcode(page, nextPostcode, existingCentres, config);
      totalCentresCollected += centres.length;

      // Filter out duplicate centres
      const uniqueCentres = centres.filter(centre => 
        !isDuplicateCentre(centre, existingCentres)
      );

      console.log(`✓ Found ${uniqueCentres.length} unique centres (${centres.length - uniqueCentres.length} duplicates filtered)`);

      // Append unique centres to CSV
      for (const centre of uniqueCentres) {
        try {
          appendCentreToCsv(csvFilePath, centre);
          totalNewCentres++;
        } catch (error) {
          console.error(`Error appending centre to CSV: ${error.message}`);
        }
      }

      // Update in-memory centre list
      existingCentres.push(...uniqueCentres);

      // Add postcode to used list
      usedPostcodes.push(nextPostcode);

      console.log(`✓ Progress: ${usedPostcodes.length}/${totalPostcodes} postcodes | ${existingCentres.length} total centres`);

      // Apply random delay before next postcode
      if (usedPostcodes.length < totalPostcodes) {
        const delayMin = config.collection?.postcodeDelay?.min || 2000;
        const delayMax = config.collection?.postcodeDelay?.max || 5000;
        console.log(`⏳ Waiting before next postcode...`);
        await randomDelay(delayMin, delayMax);
      }
    } catch (error) {
      console.error(`Error processing postcode ${nextPostcode}:`, error.message);
      console.log('⚠️  Continuing with next postcode...');
      
      // Still add to used postcodes to avoid retrying
      usedPostcodes.push(nextPostcode);
    }
  }

  // Return collection statistics
  return {
    totalPostcodesProcessed: usedPostcodes.length,
    totalCentresCollected,
    totalNewCentres,
    totalUniqueCentres: existingCentres.length,
    csvFilePath
  };
}

/**
 * Main collection entry point
 * Orchestrates the complete test centre collection workflow
 * @returns {Object} Collection results
 */
async function runCollection() {
  let browser = null;
  const startTime = Date.now();

  try {
    // Load configuration
    const config = loadConfig();
    
    // Display collection start message
    console.log('\n' + '='.repeat(60));
    console.log('🚀 UK DRIVING TEST CENTRE COLLECTION');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Configuration:');
    console.log(`   - CSV File: ${config.collection?.csvFilePath || 'test-centres.csv'}`);
    console.log(`   - Max Load More Clicks: ${config.collection?.maxLoadMoreClicks || 20}`);
    console.log(`   - Duplicate Threshold: ${config.collection?.duplicateThreshold || 3}`);
    console.log(`   - Total Postcodes: ${getPostcodeCount()}`);
    console.log('');
    console.log('⏱️  This process may take several hours to complete.');
    console.log('💡 Available centres will be notified immediately as found.');
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    // Initialize browser with stealth configuration
    console.log('🌐 Initializing browser...');
    const browserData = await initBrowser(config);
    browser = browserData.browser;
    const page = browserData.page;

    // Load credentials from environment
    const credentials = {
      licenseNumber: process.env.DVSA_LICENSE_NUMBER,
      bookingReference: process.env.DVSA_BOOKING_REFERENCE
    };

    // Validate credentials
    if (!credentials.licenseNumber || !credentials.bookingReference) {
      throw new Error('Missing credentials. Please set DVSA_LICENSE_NUMBER and DVSA_BOOKING_REFERENCE in .env file');
    }

    // Execute login flow
    console.log('🔐 Logging in to DVSA...');
    await login(page, credentials, config);

    // Navigate to change centre page
    console.log('🗺️  Navigating to change centre page...');
    await navigateToChangeCentre(page, config);

    // Execute processAllPostcodes
    console.log('📍 Starting postcode collection...');
    const stats = await processAllPostcodes(page, config);

    // Calculate duration
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor((durationMs % 60000) / 1000);

    // Display collection summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ COLLECTION COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Postcodes Processed: ${stats.totalPostcodesProcessed}`);
    console.log(`   - Centres Collected: ${stats.totalCentresCollected}`);
    console.log(`   - New Unique Centres: ${stats.totalNewCentres}`);
    console.log(`   - Total Unique Centres: ${stats.totalUniqueCentres}`);
    console.log(`   - Duration: ${durationMinutes}m ${durationSeconds}s`);
    console.log(`   - CSV File: ${stats.csvFilePath}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    // Close browser
    await closeBrowser(browser);

    // Return collection results
    return {
      totalCentres: stats.totalUniqueCentres,
      totalPostcodes: stats.totalPostcodesProcessed,
      csvFilePath: stats.csvFilePath,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: durationMs
    };
  } catch (error) {
    // Check if it's a maintenance mode error
    if (error.message.startsWith('MAINTENANCE_MODE:')) {
      const parts = error.message.replace('MAINTENANCE_MODE: ', '').split('|||');
      const maintenanceMessage = parts[0];
      const screenshotPath = parts[1] || null;
      
      console.log('\n' + '='.repeat(60));
      console.log('🛑 DVSA WEBSITE MAINTENANCE DETECTED 🛑');
      console.log('='.repeat(60));
      console.log('');
      console.log(`Message: ${maintenanceMessage}`);
      console.log('');
      console.log('The collection process has been stopped.');
      console.log('Please restart after the service is back online.');
      console.log('='.repeat(60));
      console.log('');
      
      // Send email notification with screenshot
      try {
        const { sendMaintenanceAlert } = await import('./utils/email.js');
        await sendMaintenanceAlert(maintenanceMessage, 'collection', screenshotPath);
      } catch (emailError) {
        console.log('⚠️  Could not send maintenance email alert:', emailError.message);
      }
      
      // Cleanup and exit gracefully
      if (browser) {
        await closeBrowser(browser);
      }
      process.exit(0);
    }
    
    console.error('\n❌ Collection error:', error.message);
    throw error;
  } finally {
    // Ensure browser cleanup
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
