# Screenshot Feature Documentation

## Overview

The UK Driving Test Monitor automatically captures screenshots in all notification scenarios and attaches them to email alerts. This provides visual proof and context for every important event.

## When Screenshots Are Taken

### 1. **Available Slot Notifications** 📸
- **Trigger:** When a test centre shows available slots
- **What's captured:** Full page showing the availability
- **Filename:** `availability_YYYY-MM-DDTHH-MM-SS.png`
- **Email attachment:** `availability-screenshot.png`

### 2. **Verification Challenge Alerts** 📸
- **Trigger:** When CAPTCHA or verification is detected
- **What's captured:** The verification challenge page
- **Filename:** `verification_YYYY-MM-DDTHH-MM-SS.png`
- **Email attachment:** `verification-screenshot.png`

### 3. **Maintenance Mode Alerts** 📸
- **Trigger:** When maintenance message is detected
- **What's captured:** The maintenance page with the message
- **Filename:** `maintenance_YYYY-MM-DDTHH-MM-SS.png`
- **Email attachment:** `maintenance-screenshot.png`

## Screenshot Storage

### Location
All screenshots are saved to the `screenshots/` directory in your project root.

### File Naming Convention
```
{type}_{timestamp}.png

Examples:
- availability_2024-01-15T10-30-45-123Z.png
- verification_2024-01-15T10-35-20-456Z.png
- maintenance_2024-01-15T02-15-30-789Z.png
```

### Storage Management
- Screenshots are automatically organized by timestamp
- Old screenshots can be cleaned up manually or programmatically
- The `screenshots/` directory is in `.gitignore` (not committed to version control)

## Email Integration

### How Screenshots Appear in Emails

**1. Embedded in Email Body:**
Screenshots are embedded directly in the HTML email using Content-ID (CID) references:
```html
<img src="cid:screenshot@availability" style="max-width: 100%; border: 2px solid #e5e7eb; border-radius: 8px;" />
```

**2. Also Attached as Files:**
Screenshots are attached as separate files so you can:
- Download and save them
- Forward them to others
- View them in full resolution
- Keep them for records

### Email Display

**Desktop Email Clients:**
- Screenshot displays inline in the email body
- Full resolution available
- Can be saved separately

**Mobile Email Clients:**
- Screenshot displays inline (may be scaled to fit screen)
- Tap to view full size
- Can be saved to photos

**Webmail (Gmail, Outlook, etc.):**
- Screenshot displays inline
- Can be downloaded as attachment
- Viewable in browser

## Benefits

### 1. **Visual Proof**
- See exactly what the system saw
- Verify availability claims
- Understand verification challenges
- Confirm maintenance messages

### 2. **Remote Monitoring**
- Know what's happening without being at your computer
- See the actual page state
- Make informed decisions

### 3. **Troubleshooting**
- Debug issues by reviewing screenshots
- Understand why notifications were sent
- Identify false positives

### 4. **Record Keeping**
- Keep evidence of available slots
- Track when maintenance occurs
- Document verification challenges

### 5. **Sharing**
- Forward emails with screenshots to others
- Show proof of availability
- Share maintenance schedules

## Technical Details

### Screenshot Type
- **Format:** PNG (lossless, high quality)
- **Mode:** Full page capture (not just viewport)
- **Color:** Full color (24-bit RGB)

### File Sizes
- **Typical size:** 100-500 KB per screenshot
- **Depends on:** Page length, content, images
- **Compression:** PNG default compression

### Performance Impact
- **Time to capture:** 1-3 seconds
- **Minimal delay:** Screenshots taken asynchronously
- **No blocking:** Email sending continues even if screenshot fails

## Privacy & Security

### What's Captured
Screenshots may contain:
- ✅ Test centre names and addresses (public information)
- ✅ Availability status (public information)
- ✅ DVSA website content (public information)
- ❌ Your personal credentials (NOT captured - entered before screenshot)
- ❌ Your booking reference (NOT visible in screenshots)

### Storage Security
- Screenshots stored locally on your computer
- Not uploaded to any external service
- Only sent to your configured email address
- You control retention and deletion

### Email Security
- Screenshots sent via encrypted email (TLS)
- Only to your configured `NOTIFICATION_EMAIL`
- Attachments are standard email attachments
- Subject to your email provider's security

## Managing Screenshots

### Manual Cleanup

**Delete all screenshots:**
```bash
# Windows
rmdir /s /q screenshots

# Linux/Mac
rm -rf screenshots/
```

**Delete old screenshots (older than 7 days):**
```bash
# Windows PowerShell
Get-ChildItem screenshots -Filter *.png | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item

# Linux/Mac
find screenshots -name "*.png" -mtime +7 -delete
```

### Programmatic Cleanup

The screenshot utility includes a cleanup function:

```javascript
import { cleanupOldScreenshots } from './src/utils/screenshot.js';

// Clean up screenshots older than 7 days
cleanupOldScreenshots(7);

// Clean up screenshots older than 30 days
cleanupOldScreenshots(30);
```

### Automatic Cleanup (Future Enhancement)

You could add automatic cleanup to your monitoring script:

```javascript
// In src/index.js or src/monitor.js
import { cleanupOldScreenshots } from './utils/screenshot.js';

// Clean up old screenshots before starting
cleanupOldScreenshots(7);
```

## Troubleshooting

### Screenshot Not Attached to Email

**Problem:** Email received but no screenshot attached.

**Possible Causes:**
1. Screenshot capture failed (check console for errors)
2. File path issue (check `screenshots/` directory exists)
3. Email attachment size limit exceeded (rare)

**Solutions:**
1. Check console output for screenshot errors
2. Verify `screenshots/` directory is writable
3. Check email provider's attachment size limits (usually 10-25 MB)

### Screenshot File Not Found

**Problem:** Screenshot saved but not found when sending email.

**Solutions:**
1. Check file permissions on `screenshots/` directory
2. Verify disk space is available
3. Check antivirus isn't blocking file creation

### Screenshot Quality Issues

**Problem:** Screenshot is blurry or low quality.

**Solutions:**
1. Screenshots are full resolution by default
2. Check your display scaling settings
3. Puppeteer captures at browser's resolution

### Large File Sizes

**Problem:** Screenshots are very large (>1 MB).

**Solutions:**
1. This is normal for long pages with many images
2. Consider using viewport screenshots instead of full page
3. Email providers typically support up to 10-25 MB attachments

## Configuration Options

### Change Screenshot Type

Edit `src/utils/screenshot.js`:

```javascript
// Full page (default)
await page.screenshot({
  path: filepath,
  fullPage: true,  // Captures entire page
  type: 'png'
});

// Viewport only (faster, smaller)
await page.screenshot({
  path: filepath,
  fullPage: false,  // Only visible area
  type: 'png'
});

// JPEG (smaller file size, lossy)
await page.screenshot({
  path: filepath,
  fullPage: true,
  type: 'jpeg',
  quality: 80  // 0-100
});
```

### Disable Screenshots

If you don't want screenshots, you can disable them:

**Option 1: Remove screenshot calls**
Comment out screenshot code in:
- `src/utils/notifier.js`
- `src/scraper/dvsa.js`

**Option 2: Conditional screenshots**
Add a config option:

```json
// config.json
{
  "screenshots": {
    "enabled": false
  }
}
```

Then check this config before taking screenshots.

## Examples

### Email with Availability Screenshot

**Subject:** 🎯 Driving Test Slot Available - London Test Centre

**Body:**
```
📍 Centre: London Test Centre
📮 Address: 123 Main St, London, SW1A 1AA
✅ Status: SLOTS AVAILABLE
📅 Available Dates: 2024-01-20, 2024-01-25

📸 Screenshot:
[Full page screenshot showing the availability]

⚡ ACTION REQUIRED: Book this slot immediately!
[Book Now Button]
```

### Email with Verification Screenshot

**Subject:** ⚠️ Verification Challenge Detected - Action Required

**Body:**
```
🔒 CAPTCHA Challenge Detected

The DVSA website has presented a verification challenge.

📸 Screenshot of Challenge:
[Screenshot showing the CAPTCHA]

What to do:
1. Check your computer
2. Complete the CAPTCHA
3. System will resume automatically
```

### Email with Maintenance Screenshot

**Subject:** 🛑 DVSA Website Maintenance - Service Unavailable

**Body:**
```
⏰ DVSA Website Maintenance

Message: Sorry, I'll be back at 6AM

📸 Screenshot of Maintenance Page:
[Screenshot showing the maintenance message]

What to do:
- Wait until 6AM UK time
- Restart: npm start
```

## Summary

✅ **Automatic screenshots** in all notification scenarios
✅ **Embedded in emails** for immediate viewing
✅ **Attached as files** for downloading and sharing
✅ **Stored locally** in `screenshots/` directory
✅ **Full page captures** for complete context
✅ **High quality PNG** format
✅ **Privacy-safe** - no personal credentials captured

Screenshots provide visual proof and context, making remote monitoring more effective and reliable!
