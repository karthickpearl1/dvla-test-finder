# UK Driving Test Centre Monitoring System

A comprehensive system to monitor and collect UK driving test centre availability data. The system operates in two modes: monitoring mode for periodic availability checks, and collection mode for building a complete database of UK test centres.

## Features

- **Monitoring Mode**: Periodically checks driving test centre availability for your booking
- **Collection Mode**: Discovers and catalogs all UK test centres across different regions
- **Email Notifications**: Instant email alerts when test slots become available
- Mimics human interactions with configurable delays to avoid detection
- Real-time console notifications during collection
- Automatic handling of verification challenges with manual intervention windows
- Configurable timing ranges and geographic postcode strategies
- CSV export of collected test centre data

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure:
   - `DVSA_LICENSE_NUMBER` - Your driving licence number
   - `DVSA_BOOKING_REFERENCE` - Your booking reference number
   - `NOTIFICATION_EMAIL` - Email address(es) to receive alerts (single or comma-separated list)
   - `EMAIL_USER` - Your email address (for sending notifications)
   - `EMAIL_PASSWORD` - Your email app password (see Email Setup below)
   - `EMAIL_SERVICE` - Email provider (e.g., `gmail`)
3. Configure settings in `config.json`
4. Test email notifications: `npm run test-email`
5. Run the system:
   - Monitoring mode: `npm start` or `npm run monitor`
   - Collection mode: `npm run collect`

### Email Setup

To receive email notifications when test slots become available:

1. **For Gmail users:**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password) in `EMAIL_PASSWORD`
   - Set `EMAIL_SERVICE=gmail` in your `.env` file

2. **For other email providers:**
   - Set `EMAIL_HOST`, `EMAIL_PORT`, and `EMAIL_SECURE` in `.env`
   - Example for Outlook: `EMAIL_HOST=smtp-mail.outlook.com`, `EMAIL_PORT=587`

3. **Multiple recipients (optional):**
   To send notifications to multiple people, use a comma-separated list:
   ```env
   NOTIFICATION_EMAIL=you@example.com,friend@example.com,family@example.com
   ```
   All recipients will receive the same notifications with screenshots.

4. **Test your configuration:**
   ```bash
   npm run test-email
   ```
   This sends a test email to verify your setup is working correctly.

**Email notifications are optional.** If not configured, you'll still receive console notifications.

## Monitoring Mode

### How It Works

1. Navigates to https://www.gov.uk/change-driving-test
2. Clicks "Start now" button
3. Enters driving licence number and booking reference
4. **Detects verification challenges** and sends email alert if CAPTCHA appears
5. **Pauses for manual intervention** if verification required (60 seconds)
6. Checks available test centres and dates for YOUR booking
7. **Sends email notifications** for any available slots found
8. Displays results in console
9. Saves results to `results/` folder
10. Repeats check at configured intervals (default: every 15 minutes)

### Usage

```bash
npm start
# or
npm run monitor
```

The monitor runs continuously, performing checks at the configured interval. Press `Ctrl+C` to stop.

### Email Notifications in Monitoring Mode

You'll receive email alerts for:
- **Available test slots** - Immediate notification when slots are found at any centre
- **Verification challenges** - Alert when CAPTCHA appears, so you can complete it remotely
- **Each available centre** - Separate email for each centre with available dates

This means you can run monitoring mode in the background and get notified on your phone/email whenever slots become available, without constantly watching the console.

## Collection Mode

### Purpose

Collection mode systematically discovers all UK driving test centres by searching across multiple postcodes. This builds a comprehensive CSV database of test centres that can be used for:
- Understanding geographic distribution of test centres
- Identifying all available centres in your region
- Building a reference database for availability monitoring
- Analyzing test centre coverage across the UK

### How It Works

1. Logs into DVSA website with your credentials
2. Navigates to the "Change test centre" page
3. Searches test centres using a strategic list of UK postcodes
4. For each postcode:
   - Extracts all visible test centre details (name, address, availability)
   - Clicks "Load more results" to reveal additional centres
   - Checks for duplicate centres to determine when all results are loaded
   - **Notifies you immediately if any centre shows availability** 🎯
   - Handles verification challenges with manual intervention windows
5. Saves unique test centres to CSV file
6. Selects next geographically distant postcode to maximize coverage
7. Continues until all UK regions are covered

### Usage

```bash
npm run collect
```

The collection process runs once and completes automatically. Expected duration: **2-8 hours** depending on the number of postcodes and results.

### CSV Output

Test centres are saved to `test-centres.csv` (configurable in `config.json`) with the following format:

```csv
name,address,postcode,availability,dateCollected
"London Test Centre","123 Main St","SW1A 1AA","available","2024-01-15T10:30:00Z"
"Manchester Test Centre","456 High St","M1 1AA","not_available","2024-01-15T10:35:00Z"
```

**Fields:**
- `name`: Test centre name
- `address`: Full address of the centre
- `postcode`: Postcode of the centre
- `availability`: Current status (`available`, `not_available`, or `unknown`)
- `dateCollected`: ISO 8601 timestamp when data was collected

### Postcode Strategy

The system uses a **geographic distribution strategy** to ensure comprehensive UK coverage:

- **England**: 40-50 postcodes covering major cities and regions
- **Scotland**: 10-15 postcodes
- **Wales**: 8-10 postcodes
- **Northern Ireland**: 5-8 postcodes

Postcodes are selected to maximize geographic distance between searches, ensuring:
- Minimal duplicate centres across searches
- Broad coverage of all UK regions
- Efficient discovery of unique test centres

The system automatically selects the next postcode that is furthest from all previously searched postcodes.

### Availability Notifications

During collection, you'll receive **immediate notifications** when any test centre shows availability:

**Console Notification:**
```
🎯 AVAILABILITY FOUND! 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Centre: London Test Centre
Address: 123 Main St, SW1A 1AA
Status: SLOTS AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Email Notification:**

If email is configured, you'll also receive a beautifully formatted email with:
- Test centre name and full address
- Availability status highlighted
- Available dates (if provided)
- Direct link to book the slot
- **Screenshot of the availability page** (visual proof)
- Mobile-friendly HTML design

**When notifications are sent:**
- Immediately when a centre with available slots is discovered
- During initial postcode search results
- After clicking "Load more results" and finding new available centres
- Both console and email notifications are sent simultaneously
- Each centre is notified only once to avoid duplicate alerts

This allows you to take action on available slots without waiting for the entire collection to complete, even if you're away from your computer.

### Website Maintenance Detection

The DVSA website occasionally displays maintenance messages (e.g., "Sorry, I'll be back at 6AM"). The system automatically detects and handles these:

**What Happens:**
1. System detects maintenance message after clicking "Start now"
2. **Sends email alert** with the maintenance message
3. Displays console notification with details
4. **Stops the process gracefully** (no errors or crashes)
5. Saves any data collected so far

**Email Notification:**
- Subject: "🛑 DVSA Website Maintenance - Service Unavailable"
- Includes the exact maintenance message from the website
- **Screenshot of the maintenance page** attached
- Provides instructions on when to restart
- Suggests running during daytime hours (DVSA maintenance typically midnight-6AM UK time)

**What to Do:**
- Wait until the service is back online (usually 6AM UK time)
- Restart monitoring: `npm start`
- Or restart collection: `npm run collect`

**Tip:** DVSA typically performs maintenance between midnight and 6AM UK time. Consider running the monitor during daytime hours to avoid interruptions.

### Verification Challenge Handling

The DVSA website may present verification challenges (CAPTCHA, security checks) during collection. The system handles these automatically:

**Detection:**
- Monitors for CAPTCHA elements on the page
- Detects verification prompt text
- Checks for security challenge indicators

**Manual Intervention Process:**
1. System detects verification challenge
2. **Sends email alert** to your notification address (if configured)
3. **Pauses automation** and displays prominent notification:
   ```
   ⚠️  VERIFICATION CHALLENGE DETECTED ⚠️
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Please complete the verification in the browser window.
   The system will automatically resume after 60 seconds.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
4. Browser remains **visible and interactive**
5. You have time to complete the verification manually
6. System waits for configured timeout (default: 60 seconds)
7. **Automatically resumes** after timeout
8. Continues with remaining tasks

**Email Alerts for Verification:**
- Sent immediately when CAPTCHA is detected
- Includes step-by-step instructions
- **Screenshot of the verification challenge** attached
- Alerts you even if you're away from your computer
- Helps you respond quickly before timeout expires

**Timeout Settings:**
- Default verification timeout: 60 seconds (configurable in `config.json`)
- Adjust `collection.verificationTimeout` to allow more/less time
- Increase timeout if monitoring remotely (120-180 seconds recommended)
- System continues even if verification isn't completed (may need manual restart)

**Best Practices:**
- Keep browser visible (set `headless: false` in config)
- Use realistic delays to minimize detection
- Enable email notifications for remote monitoring
- See `VERIFICATION_HANDLING_GUIDE.md` for detailed strategies

### Resource Usage

**Duration:**
- Per postcode: 2-5 minutes (varies with number of results)
- Total postcodes: 50-100 for complete UK coverage
- **Total duration: 2-8 hours**

**System Resources:**
- Memory: ~5-10 MB for centre data
- Disk: ~2-5 MB for CSV file
- Network: Minimal bandwidth (HTML pages only)
- CPU: Low usage with human-like delays

**Recommendations:**
- Run on a stable internet connection
- Ensure sufficient disk space for CSV output
- Keep system awake during collection (disable sleep mode)
- Monitor console for availability notifications

## Configuration

Edit `config.json` to customize behavior:

### Monitoring Configuration
- `delays`: Delay ranges (min/max in milliseconds) for human-like behavior
  - `pageLoad`: Delay after page loads
  - `typing`: Delay between keystrokes
  - `clicking`: Delay before clicks
  - `navigation`: Delay between navigation actions
- `monitoring.checkIntervalMinutes`: Time between checks (default: 15 minutes)
- `monitoring.manualInterventionTimeout`: Pause duration for CAPTCHA (default: 30 seconds)
- `monitoring.headless`: Run browser in background (default: false)

### Collection Configuration
- `collection.csvFilePath`: Output CSV file path (default: "test-centres.csv")
- `collection.maxLoadMoreClicks`: Safety limit for "Load more" clicks (default: 20)
- `collection.duplicateThreshold`: Number of duplicates before stopping (default: 3)
- `collection.verificationTimeout`: Seconds to wait for verification (default: 60)
- `collection.postcodeDelay`: Delay range between postcode searches
- `postcodes.strategy`: Postcode selection strategy (default: "geographic")
- `postcodes.customList`: Optional custom postcode list (overrides default)
