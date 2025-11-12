import dotenv from 'dotenv';
import { loadConfig, saveResults } from './utils/config.js';
import { initBrowser, closeBrowser } from './scraper/browser.js';
import { login, checkAvailability, detectVerificationChallenge, handleVerificationPause } from './scraper/dvsa.js';
import { notifyAvailability } from './utils/notifier.js';

dotenv.config();

export async function runMonitor() {
  const config = loadConfig();
  let browser = null;

  try {
    console.log('Starting monitoring session...');
    console.log(`Delays configured: ${config.delays.pageLoad.min}-${config.delays.pageLoad.max}s`);
    
    const { browser: br, page } = await initBrowser(config);
    browser = br;

    const credentials = {
      licenseNumber: process.env.DVSA_LICENSE_NUMBER,
      bookingReference: process.env.DVSA_BOOKING_REFERENCE
    };

    if (!credentials.licenseNumber || !credentials.bookingReference) {
      throw new Error('Missing credentials in .env file. Need DVSA_LICENSE_NUMBER and DVSA_BOOKING_REFERENCE');
    }

    await login(page, credentials, config);
    
    // Check for verification challenge after login
    const hasChallenge = await detectVerificationChallenge(page);
    if (hasChallenge) {
      await handleVerificationPause(page, config, 'monitoring');
    }
    
    const availability = await checkAvailability(page, config);

    const results = {
      timestamp: new Date().toISOString(),
      centres: availability,
      totalAvailable: availability.length
    };

    console.log(`\nFound ${results.totalAvailable} centres with availability:`);
    
    // Send notifications for each available centre
    for (const centre of availability) {
      console.log(`- ${centre.name}: ${centre.dates?.length || 0} dates available`);
      
      // Send email notification for available centres
      if (centre.available || (centre.dates && centre.dates.length > 0)) {
        await notifyAvailability({
          name: centre.name,
          address: centre.address || 'Address not available',
          postcode: centre.postcode || '',
          availability: 'available',
          dates: centre.dates || []
        }, page);
      }
    }

    const filename = saveResults(results);
    console.log(`\nResults saved to: results/${filename}`);

    return results;

  } catch (error) {
    // Check if it's a maintenance mode error
    if (error.message.startsWith('MAINTENANCE_MODE:')) {
      const parts = error.message.replace('MAINTENANCE_MODE: ', '').split('|||');
      const maintenanceMessage = parts[0];
      const screenshotPath = parts[1] || null;
      
      console.log(`\n🔍 Debug: Screenshot path = ${screenshotPath}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('🛑 DVSA WEBSITE MAINTENANCE DETECTED 🛑');
      console.log('='.repeat(60));
      console.log('');
      console.log(`Message: ${maintenanceMessage}`);
      console.log('');
      console.log('The monitoring process has been stopped.');
      console.log('Please restart after the service is back online.');
      console.log('='.repeat(60));
      console.log('');
      
      // Send email notification with screenshot
      try {
        const { sendMaintenanceAlert } = await import('./utils/email.js');
        await sendMaintenanceAlert(maintenanceMessage, 'monitoring', screenshotPath);
      } catch (emailError) {
        console.log('⚠️  Could not send maintenance email alert:', emailError.message);
      }
      
      // Exit gracefully
      await closeBrowser(browser);
      process.exit(0);
    }
    
    console.error('Monitor error:', error.message);
    throw error;
  } finally {
    await closeBrowser(browser);
  }
}
