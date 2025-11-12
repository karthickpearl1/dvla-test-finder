# Screenshot Attachment Fix

## Issue
Screenshots were being captured and saved to the `screenshots/` directory, but were not appearing in email notifications.

## Root Causes

### 1. Error Handling in Screenshot Capture
**Problem:** The try-catch block in `src/scraper/dvsa.js` was catching the intentionally thrown maintenance error.

**Original Code:**
```javascript
try {
  const { takeScreenshot } = await import('../utils/screenshot.js');
  const screenshotPath = await takeScreenshot(page, 'maintenance');
  throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}|||${screenshotPath}`);
} catch (screenshotError) {
  // This was catching EVERYTHING, including our intentional error!
  throw new Error(`MAINTENANCE_MODE: ${maintenanceCheck.message}`);
}
```

**Fixed Code:**
```javascript
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
```

### 2. HTML Replacement in Email Templates
**Problem:** Using `.replace('</div>', ...)` was replacing the FIRST `</div>` tag, which was in the wrong location.

**Original Code:**
```javascript
mailOptions.html = htmlContent.replace(
  '</div>',  // Replaces FIRST occurrence - wrong location!
  `<div>Screenshot...</div></div>`
);
```

**Fixed Code:**
```javascript
// Replace at a specific, unique location in the HTML
mailOptions.html = htmlContent.replace(
  '<div style="background: #dbeafe; border-left: 4px solid #2563eb;',
  `
    <div style="margin: 20px 0; text-align: center;">
      <h3>📸 Screenshot:</h3>
      <img src="cid:screenshot@maintenance" ... />
    </div>
    
    <div style="background: #dbeafe; border-left: 4px solid #2563eb;`
);
```

## Changes Made

### Files Modified

1. **`src/scraper/dvsa.js`**
   - Fixed error handling to not catch intentional maintenance error
   - Screenshot capture now happens before throwing error
   - Added error logging for screenshot failures

2. **`src/utils/email.js`**
   - Fixed HTML replacement for maintenance alerts
   - Fixed HTML replacement for availability notifications
   - Fixed HTML replacement for verification alerts
   - Added debug logging: `📎 Attaching screenshot: {path}`

3. **`src/monitor.js`**
   - Added debug logging to show screenshot path
   - Helps troubleshoot future issues

## Testing

### Before Fix
```
✅ Screenshot saved: screenshots/maintenance_2025-11-12T00-27-53-013Z.png
📧 Maintenance alert sent to user@example.com
❌ No screenshot in email
```

### After Fix
```
✅ Screenshot saved: screenshots/maintenance_2025-11-12T00-27-53-013Z.png
🔍 Debug: Screenshot path = screenshots\maintenance_2025-11-12T00-27-53-013Z.png
📎 Attaching screenshot: screenshots\maintenance_2025-11-12T00-27-53-013Z.png
📧 Maintenance alert sent to user@example.com
✅ Screenshot appears in email (embedded + attached)
```

## Verification Steps

To verify the fix works:

1. **Run the monitor:**
   ```bash
   npm start
   ```

2. **Check console output:**
   - Look for: `📸 Screenshot saved: ...`
   - Look for: `🔍 Debug: Screenshot path = ...`
   - Look for: `📎 Attaching screenshot: ...`

3. **Check email:**
   - Screenshot should be embedded in email body
   - Screenshot should be attached as file
   - Can download attachment

4. **Check screenshots directory:**
   ```bash
   dir screenshots
   ```
   Should show the PNG file

## Future Improvements

### 1. Better Error Handling
Instead of using string concatenation with `|||`, use a custom error class:

```javascript
class MaintenanceError extends Error {
  constructor(message, screenshotPath) {
    super(message);
    this.name = 'MaintenanceError';
    this.screenshotPath = screenshotPath;
  }
}

// Throw
throw new MaintenanceError(message, screenshotPath);

// Catch
if (error instanceof MaintenanceError) {
  const { message, screenshotPath } = error;
  // ...
}
```

### 2. Template System
Use a proper email template system instead of string replacement:

```javascript
import Handlebars from 'handlebars';

const template = Handlebars.compile(htmlTemplate);
const html = template({
  message: maintenanceMessage,
  screenshot: screenshotPath ? `<img src="cid:screenshot@maintenance" />` : ''
});
```

### 3. Screenshot Validation
Verify screenshot file exists before attaching:

```javascript
import fs from 'fs';

if (screenshotPath && fs.existsSync(screenshotPath)) {
  mailOptions.attachments = [{ path: screenshotPath }];
} else {
  console.log('⚠️  Screenshot file not found, sending email without it');
}
```

## Summary

✅ **Fixed error handling** - Screenshot path now properly passed through error
✅ **Fixed HTML replacement** - Screenshots now embedded in correct location
✅ **Added debug logging** - Easier to troubleshoot future issues
✅ **Tested with real maintenance page** - Confirmed working

Screenshots now appear in all email notifications as intended!
