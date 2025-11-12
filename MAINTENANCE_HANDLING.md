# DVSA Website Maintenance Handling

## Overview

The DVSA website occasionally displays maintenance messages, typically during overnight hours. The UK Driving Test Monitor automatically detects these messages and handles them gracefully.

## Common Maintenance Messages

The system detects various maintenance patterns:
- "Sorry, I'll be back at 6AM"
- "Service temporarily unavailable"
- "Under maintenance"
- "Scheduled maintenance"
- "System maintenance"

## What Happens When Maintenance is Detected

### 1. Automatic Detection
The system checks for maintenance messages immediately after clicking "Start now" on the DVSA website.

### 2. Email Notification
You receive an email alert with:
- **Subject:** "🛑 DVSA Website Maintenance - Service Unavailable"
- **Content:**
  - The exact maintenance message from the website
  - Explanation of what happened
  - Instructions on when to restart
  - Tips for avoiding future interruptions

### 3. Console Notification
```
🛑 DVSA WEBSITE MAINTENANCE DETECTED 🛑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message: Sorry, I'll be back at 6AM

The monitoring/collection process has been stopped.
Please restart after the service is back online.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Graceful Shutdown
- Process stops cleanly (no errors or crashes)
- Browser closes properly
- Any data collected so far is saved
- Exit code 0 (successful termination)

## When Does DVSA Maintenance Occur?

**Typical Schedule:**
- **Time:** Midnight to 6AM UK time
- **Frequency:** Most nights, but not always
- **Duration:** Usually until 6AM, sometimes earlier

**Best Times to Run:**
- **Daytime:** 8AM - 10PM UK time (lowest maintenance risk)
- **Weekdays:** Generally more reliable than weekends
- **Avoid:** Midnight - 6AM UK time

## How to Restart After Maintenance

### For Monitoring Mode:
```bash
npm start
# or
npm run monitor
```

### For Collection Mode:
```bash
npm run collect
```

**Note:** Collection mode will resume from where it left off if you've already collected some centres (they're saved in the CSV file).

## Preventing Maintenance Interruptions

### 1. Schedule Your Runs
Run the monitor during DVSA's operational hours:
```bash
# Example: Run between 8AM and 10PM
# Use Windows Task Scheduler or cron jobs
```

### 2. Use Monitoring Mode
Instead of long collection runs:
- Use monitoring mode for continuous checking
- Runs in shorter intervals (15 minutes)
- Less likely to hit maintenance windows
- Automatically retries after maintenance

### 3. Check Before Running
Visit https://www.gov.uk/change-driving-test manually to verify the service is available before starting a long collection.

## Email Alert Example

**Subject:** 🛑 DVSA Website Maintenance - Service Unavailable

**Body:**
```
⏰ DVSA Website Maintenance

The DVSA website is currently unavailable for maintenance during monitoring mode.

Message: Sorry, I'll be back at 6AM

What happened:
- The DVSA website displayed a maintenance message
- The monitoring/collection process has been stopped
- No further checks will be performed until you restart

What to do:
- Wait until the service is back online (usually 6AM UK time)
- Restart the monitor: npm start
- Or restart collection: npm run collect

💡 Tip: DVSA typically performs maintenance between midnight and 6AM UK time. 
Consider running the monitor during daytime hours.
```

## Troubleshooting

### Email Not Received

**Problem:** Maintenance detected but no email sent.

**Solutions:**
1. Check email configuration: `npm run test-email`
2. Verify `NOTIFICATION_EMAIL` is set in `.env`
3. Check spam/junk folder
4. Review console output for email errors

### Process Doesn't Stop

**Problem:** Process continues despite maintenance message.

**Solutions:**
1. Check console for error messages
2. Manually stop with `Ctrl+C`
3. Update to latest version
4. Report issue with console logs

### Maintenance Message Not Detected

**Problem:** Process fails with error instead of detecting maintenance.

**Solutions:**
1. Check if DVSA changed their maintenance message format
2. Review console logs for the actual error
3. Manually check the DVSA website
4. Report the new maintenance message format

## Advanced: Automatic Retry Logic (Future Enhancement)

Currently, the system stops when maintenance is detected. Future versions could include:

### Option 1: Scheduled Retry
```json
{
  "maintenance": {
    "autoRetry": true,
    "retryAfterMinutes": 60,
    "maxRetries": 6
  }
}
```

### Option 2: Smart Scheduling
```json
{
  "maintenance": {
    "avoidHours": [0, 1, 2, 3, 4, 5],
    "preferredHours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  }
}
```

## Summary

✅ **Automatic detection** of maintenance messages
✅ **Email alerts** sent immediately
✅ **Graceful shutdown** with no errors
✅ **Data preservation** - collected centres are saved
✅ **Clear instructions** on when to restart

**Best Practice:** Run the monitor during DVSA's operational hours (8AM-10PM UK time) to minimize maintenance interruptions.

## Related Documentation

- `README.md` - Full system documentation
- `EMAIL_SETUP_GUIDE.md` - Email notification setup
- `VERIFICATION_HANDLING_GUIDE.md` - CAPTCHA handling strategies
