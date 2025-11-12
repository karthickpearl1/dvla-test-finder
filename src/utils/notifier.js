import { sendEmailNotification } from './email.js';

// Track centres that have already been notified
const notifiedCentres = new Set();

/**
 * Generates a unique key for a centre to track notifications
 * @param {Object} centre - Test centre object
 * @returns {string} Unique identifier for the centre
 */
function getCentreKey(centre) {
  // Normalize name and address for consistent comparison
  const name = (centre.name || '').toLowerCase().trim();
  const address = (centre.address || '').toLowerCase().trim();
  return `${name}|${address}`;
}

/**
 * Checks if a centre has already been notified
 * @param {Object} centre - Test centre object with name and address
 * @returns {boolean} True if centre has been notified, false otherwise
 */
export function hasBeenNotified(centre) {
  const key = getCentreKey(centre);
  return notifiedCentres.has(key);
}

/**
 * Displays a prominent notification for an available test centre
 * @param {Object} centre - Test centre object with name, address, and availability
 * @param {Page} page - Optional Puppeteer page object for screenshot
 */
export async function notifyAvailability(centre, page = null) {
  // Check if already notified to avoid duplicates
  if (hasBeenNotified(centre)) {
    return;
  }

  // Mark as notified
  const key = getCentreKey(centre);
  notifiedCentres.add(key);

  // Display prominent notification with visual separators
  console.log('\n');
  console.log('🎯'.repeat(20));
  console.log('🚨 AVAILABILITY FOUND! 🚨');
  console.log('🎯'.repeat(20));
  console.log('');
  console.log(`📍 Centre: ${centre.name || 'Unknown'}`);
  
  if (centre.address) {
    console.log(`📮 Address: ${centre.address}`);
  }
  
  if (centre.postcode) {
    console.log(`🗺️  Postcode: ${centre.postcode}`);
  }
  
  console.log(`✅ Status: ${centre.availability || 'SLOTS AVAILABLE'}`);
  
  if (centre.dates && centre.dates.length > 0) {
    console.log(`📅 Available Dates: ${centre.dates.join(', ')}`);
  }
  
  console.log('');
  console.log('━'.repeat(60));
  console.log('⚡ ACTION REQUIRED: Book this slot immediately! ⚡');
  console.log('━'.repeat(60));
  console.log('\n');

  // Take screenshot if page is provided
  let screenshotPath = null;
  if (page) {
    try {
      const { takeScreenshot } = await import('./screenshot.js');
      screenshotPath = await takeScreenshot(page, 'availability');
    } catch (error) {
      console.error('⚠️  Failed to take screenshot:', error.message);
    }
  }

  // Send email notification with screenshot
  try {
    await sendEmailNotification(centre, screenshotPath);
  } catch (error) {
    console.error('⚠️  Failed to send email notification:', error.message);
  }
}

/**
 * Resets the notification tracking (useful for testing or new sessions)
 */
export function resetNotifications() {
  notifiedCentres.clear();
}
