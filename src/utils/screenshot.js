import fs from 'fs';
import path from 'path';

/**
 * Ensure screenshots directory exists
 */
function ensureScreenshotsDir() {
  const dir = 'screenshots';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Take a screenshot and save it to the screenshots directory
 * @param {Page} page - Puppeteer page object
 * @param {string} type - Type of screenshot (availability, verification, maintenance)
 * @returns {Promise<string>} Path to the saved screenshot
 */
export async function takeScreenshot(page, type = 'general') {
  try {
    const dir = ensureScreenshotsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}_${timestamp}.png`;
    const filepath = path.join(dir, filename);
    
    // Take full page screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`📸 Screenshot saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('❌ Failed to take screenshot:', error.message);
    return null;
  }
}

/**
 * Take a screenshot of just the viewport (visible area)
 * @param {Page} page - Puppeteer page object
 * @param {string} type - Type of screenshot
 * @returns {Promise<string>} Path to the saved screenshot
 */
export async function takeViewportScreenshot(page, type = 'general') {
  try {
    const dir = ensureScreenshotsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}_viewport_${timestamp}.png`;
    const filepath = path.join(dir, filename);
    
    // Take viewport screenshot (faster, smaller file)
    await page.screenshot({
      path: filepath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`📸 Viewport screenshot saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('❌ Failed to take viewport screenshot:', error.message);
    return null;
  }
}

/**
 * Clean up old screenshots (older than specified days)
 * @param {number} daysToKeep - Number of days to keep screenshots
 */
export function cleanupOldScreenshots(daysToKeep = 7) {
  try {
    const dir = 'screenshots';
    if (!fs.existsSync(dir)) {
      return;
    }
    
    const files = fs.readdirSync(dir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filepath = path.join(dir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${deletedCount} old screenshot(s)`);
    }
  } catch (error) {
    console.error('⚠️  Failed to cleanup old screenshots:', error.message);
  }
}

/**
 * Get screenshot as base64 for email embedding
 * @param {string} filepath - Path to screenshot file
 * @returns {string|null} Base64 encoded image or null
 */
export function getScreenshotBase64(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return null;
    }
    
    const imageBuffer = fs.readFileSync(filepath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('❌ Failed to read screenshot:', error.message);
    return null;
  }
}
