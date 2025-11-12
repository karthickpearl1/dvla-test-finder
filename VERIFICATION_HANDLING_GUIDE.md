# Verification Challenge Handling Guide

This guide explains how the UK Driving Test Monitor handles CAPTCHA and verification challenges, and provides best practices to minimize disruptions.

## How Verification Challenges Are Handled

### Automatic Detection

The system automatically detects verification challenges by looking for:
- CAPTCHA elements (reCAPTCHA, hCAPTCHA, etc.)
- Verification prompt text ("verify you are human", "security check", etc.)
- Security challenge indicators

### When Detected

**1. Console Alert** - Immediate notification in your terminal:
```
🔒 VERIFICATION CHALLENGE DETECTED 🔒
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  A CAPTCHA or verification challenge has been detected.

📋 INSTRUCTIONS:
   1. The browser window should be visible
   2. Please complete the verification manually
   3. Do NOT close the browser window
   4. Automation will resume automatically

⏱️  Waiting for 60 seconds...
```

**2. Email Alert** - Sent to your notification email:
- Subject: "⚠️ Verification Challenge Detected - Action Required"
- Includes instructions for manual intervention
- Alerts you even if you're away from your computer

**3. Automatic Pause** - System waits for manual completion:
- Default: 60 seconds (configurable)
- Browser remains visible and interactive
- You can complete the CAPTCHA manually
- System automatically resumes after timeout

**4. Automatic Resume** - Continues where it left off:
- No need to restart the process
- Continues with remaining tasks
- Maintains session state

## Email Notifications for Verification

### What You'll Receive

When a verification challenge is detected, you'll get an email with:
- **Alert Type**: CAPTCHA Challenge Detected
- **Mode**: Monitoring or Collection
- **Action Required**: Complete verification manually
- **Instructions**: Step-by-step guide
- **Timing**: How long the system will wait

### Why This Matters

- **Remote Monitoring**: Get alerted even when away from your computer
- **Quick Response**: Return to complete verification before timeout
- **Avoid Failures**: Prevents session timeouts and failed runs
- **Peace of Mind**: Know immediately when manual intervention is needed

## Best Practices to Minimize Verification Challenges

### 1. Use Realistic Delays

Configure human-like delays in `config.json`:

```json
{
  "delays": {
    "pageLoad": { "min": 2000, "max": 5000 },
    "typing": { "min": 100, "max": 300 },
    "clicking": { "min": 500, "max": 1500 },
    "navigation": { "min": 1000, "max": 3000 }
  }
}
```

**Recommendations:**
- **Don't go too fast**: Increase minimum delays
- **Add randomness**: Larger range between min/max
- **Longer page loads**: Give pages time to fully load

### 2. Run Browser in Visible Mode

In `config.json`:
```json
{
  "monitoring": {
    "headless": false
  }
}
```

**Why?**
- Easier to complete CAPTCHAs manually
- Can see what's happening in real-time
- Some sites detect headless browsers

### 3. Use Stealth Mode (Already Enabled)

The system uses `puppeteer-extra-plugin-stealth` to:
- Hide automation indicators
- Mimic real browser behavior
- Reduce detection likelihood

### 4. Limit Frequency

**For Monitoring Mode:**
```json
{
  "monitoring": {
    "checkIntervalMinutes": 15
  }
}
```

**Recommendations:**
- Don't check too frequently (minimum 10-15 minutes)
- Spread out checks throughout the day
- Avoid running 24/7 if possible

**For Collection Mode:**
- Run during off-peak hours (late night/early morning)
- Don't run multiple collections back-to-back
- Space out collection runs by several hours or days

### 5. Configure Longer Verification Timeout

In `config.json`:
```json
{
  "collection": {
    "verificationTimeout": 120
  }
}
```

**Recommendations:**
- Default: 60 seconds
- If you're monitoring remotely: 120-180 seconds
- Gives you more time to respond to email alerts

### 6. Use Residential IP Address

**Avoid:**
- VPNs (often flagged)
- Data center IPs
- Proxy servers
- Tor network

**Prefer:**
- Home internet connection
- Residential ISP
- Stable IP address

### 7. Maintain Browser Session

**For Monitoring Mode:**
- The system creates a new session each check
- Consider keeping browser open between checks (future enhancement)

**For Collection Mode:**
- Single session for entire collection
- Maintains cookies and session state
- Less likely to trigger challenges mid-collection

## Troubleshooting Verification Issues

### Challenge Appears Every Time

**Problem:** CAPTCHA appears on every login attempt.

**Solutions:**
1. Increase delays in `config.json` (make them 2-3x longer)
2. Check if you're using a VPN - disable it
3. Run during different times of day
4. Wait 24 hours before trying again
5. Clear browser cache and cookies (delete `userDataDir` folder)

### Email Alert Not Received

**Problem:** Verification detected but no email sent.

**Solutions:**
1. Check email configuration: `npm run test-email`
2. Verify `NOTIFICATION_EMAIL` is set in `.env`
3. Check spam/junk folder
4. Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are correct

### Timeout Too Short

**Problem:** Not enough time to complete verification.

**Solutions:**
1. Increase `verificationTimeout` in `config.json`
2. Keep computer nearby when running
3. Enable email notifications for remote alerts
4. Consider running during times when you're available

### Verification Fails After Completion

**Problem:** Completed CAPTCHA but system still fails.

**Solutions:**
1. Ensure you clicked "Submit" or "Verify" button
2. Wait for page to fully load after verification
3. Check console for error messages
4. Try increasing `verificationTimeout`
5. Restart the process if needed

## Advanced Strategies

### 1. Session Persistence (Future Enhancement)

Save browser session between runs:
- Cookies persist
- Login state maintained
- Fewer verification challenges

### 2. Rotating User Agents

The system already uses realistic user agents, but you can:
- Update `puppeteer-extra-plugin-stealth` regularly
- Use latest Chrome version

### 3. Human-Like Mouse Movements (Future Enhancement)

Add random mouse movements and scrolling:
- Makes automation less detectable
- Mimics real user behavior

### 4. Distributed Checking

Instead of one long collection:
- Run shorter collection sessions
- Spread across multiple days
- Reduces detection likelihood

## Configuration Examples

### Conservative (Minimal Detection Risk)

```json
{
  "delays": {
    "pageLoad": { "min": 3000, "max": 7000 },
    "typing": { "min": 150, "max": 400 },
    "clicking": { "min": 800, "max": 2000 },
    "navigation": { "min": 2000, "max": 5000 }
  },
  "monitoring": {
    "checkIntervalMinutes": 20,
    "headless": false
  },
  "collection": {
    "verificationTimeout": 120
  }
}
```

### Balanced (Default)

```json
{
  "delays": {
    "pageLoad": { "min": 2000, "max": 5000 },
    "typing": { "min": 100, "max": 300 },
    "clicking": { "min": 500, "max": 1500 },
    "navigation": { "min": 1000, "max": 3000 }
  },
  "monitoring": {
    "checkIntervalMinutes": 15,
    "headless": false
  },
  "collection": {
    "verificationTimeout": 60
  }
}
```

### Aggressive (Faster but Higher Risk)

```json
{
  "delays": {
    "pageLoad": { "min": 1000, "max": 3000 },
    "typing": { "min": 50, "max": 150 },
    "clicking": { "min": 300, "max": 800 },
    "navigation": { "min": 500, "max": 1500 }
  },
  "monitoring": {
    "checkIntervalMinutes": 10,
    "headless": false
  },
  "collection": {
    "verificationTimeout": 60
  }
}
```

## Summary

✅ **Verification challenges are automatically detected**
✅ **Email alerts sent immediately when detected**
✅ **System pauses for manual intervention**
✅ **Automatically resumes after completion**
✅ **Works in both monitoring and collection modes**

**Best Practice:** Start with conservative settings, then gradually reduce delays if no challenges appear.

**Remember:** The goal is to find test slots, not to avoid all verification. Manual intervention is sometimes necessary and expected.
