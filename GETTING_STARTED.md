# Getting Started - UK Driving Test Monitor

## Welcome! 👋

This guide will help you set up and run the UK Driving Test Monitor for the first time. Follow these steps carefully to get started.

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** installed (version 16 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org

2. **Your DVSA Booking Details**:
   - Driving licence number (16 characters)
   - Booking reference number (8 digits)

3. **Email Account** (for notifications):
   - Gmail recommended (easiest setup)
   - Or any SMTP email service

4. **Optional: Proxy Service** (recommended for production):
   - Smartproxy, Bright Data, or similar
   - Not required for testing

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (Puppeteer, Nodemailer, etc.)

---

### Step 2: Configure Your Credentials

#### 2.1 Copy the Example Environment File

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Or manually copy .env.example to .env
```

#### 2.2 Edit `.env` File

Open `.env` in a text editor and fill in your details:

```env
# UK Driving Test Booking Credentials
DVSA_LICENSE_NUMBER=YOUR_16_CHAR_LICENSE_NUMBER
DVSA_BOOKING_REFERENCE=YOUR_8_DIGIT_REFERENCE

# Email Notification Settings
NOTIFICATION_EMAIL=your@email.com

# Email Service Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Important Notes:**
- **Gmail users**: Use an App Password, not your regular password
  - Generate at: https://myaccount.google.com/apppasswords
  - Select "Mail" and "Windows Computer"
  - Copy the 16-character password

- **Multiple recipients**: Separate with commas
  ```env
  NOTIFICATION_EMAIL=you@gmail.com,partner@gmail.com,friend@gmail.com
  ```

---

### Step 3: Test Email Configuration (Optional but Recommended)

```bash
npm run test-email
```

You should see:
```
✅ Email notifications enabled
✅ Test email sent successfully to your@email.com
```

Check your inbox for the test email.

---

### Step 4: Start Monitoring

```bash
npm start
```

Or explicitly:
```bash
npm run monitor
```

---

## 📖 What Happens Next?

### First Run Output:

```
Starting monitoring session...
Delays configured: 2-5s

🚀 PREPARING NEW SESSION
══════════════════════════════════════════════════════════════════════

📋 Session Configuration:
   Browser:     CHROME
   User Agent:  Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
   Proxy:       Disabled

🌐 Launching CHROME browser...
✅ CHROME browser initialized successfully
══════════════════════════════════════════════════════════════════════

=== MODULE 1: LOGIN FLOW ===

Step 1: Navigating to DVSA login page...
✅ Page navigation completed

Step 2: Verifying login page loaded correctly...
✅ Login page verified (found #driving-licence-number)

Step 3: Checking for maintenance mode...
✅ No maintenance mode detected

Step 4: Checking for CAPTCHA after page load...
✅ No CAPTCHA detected, proceeding...

Step 5: Verifying all login form elements...
✅ All login form elements verified

Step 6: Entering driving licence number...
✅ Entered: YOUR_LICENSE_NUMBER

Step 7: Entering booking reference...
✅ Entered: YOUR_REFERENCE

Step 8: Submitting login form...
✅ Navigation completed after login

Step 9: Verifying booking details page loaded correctly...
✅ Booking details page verified (found #page-ibs-summary)

=== MODULE 1 COMPLETE ===

Checking for available test slots...
No available slots found at this time.

Next check in 15 minutes...
```

### The Browser Window:

- A Chrome browser window will open (visible by default)
- You'll see it navigate through the DVSA website
- **Do NOT close this window** - it's working!
- The system will automatically check every 15 minutes

### When Slots Are Found:

You'll receive an **email notification** with:
- Test centre name
- Available dates
- Screenshot of the page
- Direct link to book

---

## ⚙️ Configuration

### Adjust Check Frequency

Edit `config.json`:

```json
{
  "monitoring": {
    "checkIntervalMinutes": 15
  }
}
```

**Recommendations:**
- **Testing**: 2-5 minutes
- **Production**: 10-15 minutes (reduces detection risk)
- **With proxy**: 5-10 minutes

### Run in Background (Headless Mode)

Edit `config.json`:

```json
{
  "monitoring": {
    "headless": true
  }
}
```

**Note**: You won't see the browser window, but it's still running.

---

## 🎯 Common Scenarios

### Scenario 1: CAPTCHA Appears

**What you'll see:**
```
🔒 CAPTCHA CHALLENGE DETECTED 🔒
⚠️  A CAPTCHA challenge has been detected on the page.

📋 INSTRUCTIONS:
   1. Look at the browser window (it should be visible)
   2. Complete the CAPTCHA challenge manually
   3. Wait for the login form to appear
   4. Do NOT close the browser window
   5. Automation will resume automatically

⏱️  Waiting for 30 seconds...
```

**What to do:**
1. Look at the browser window
2. Complete the CAPTCHA (click images, checkboxes, etc.)
3. Wait - the system will continue automatically
4. You'll also receive an email notification

---

### Scenario 2: Maintenance Mode

**What you'll see:**
```
🛑 Maintenance mode detected: Sorry, the service will be back at 6am
```

**What to do:**
- Nothing! The system will stop automatically
- You'll receive an email notification
- Restart the monitor after maintenance ends

---

### Scenario 3: Security Block

**What you'll see:**
```
⚠️  DVSA SECURITY BLOCK DETECTED ⚠️
Your IP has been blocked by DVSA security system
```

**What to do:**
1. Wait 1-2 hours before retrying
2. Consider using a proxy service (see Advanced Setup)
3. Reduce check frequency in config.json

---

## 📧 Email Notifications

You'll receive emails for:

1. **✅ Available Test Slots**
   - Centre name and dates
   - Screenshot attached
   - Immediate notification

2. **🔒 CAPTCHA Challenges**
   - Alert to complete manually
   - Screenshot attached

3. **🛑 Maintenance Mode**
   - Service unavailable message
   - Expected return time

4. **⚠️ Security Blocks**
   - IP blocked notification
   - Recommendations to resolve

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
npm install
```

### Issue: "Login failed" or "Wrong page loaded"

**Possible causes:**
1. Incorrect credentials in `.env`
2. DVSA website changed
3. Proxy blocking (if enabled)

**Solution:**
1. Double-check your credentials
2. Try without proxy first
3. Check screenshots in `screenshots/` folder

### Issue: "Email not sending"

**Solution:**
1. Run `npm run test-email` to diagnose
2. For Gmail: Ensure you're using App Password, not regular password
3. Check EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD in `.env`

### Issue: Browser crashes or freezes

**Solution:**
1. Restart the monitor
2. Reduce check frequency
3. Enable headless mode in config.json

---

## 📁 Project Structure

```
uk-driving-test-monitor/
├── src/
│   ├── index.js           # Main entry point
│   ├── monitor.js         # Monitoring mode
│   ├── collector.js       # Collection mode
│   ├── scraper/
│   │   ├── dvsa.js        # DVSA website automation
│   │   └── browser.js     # Browser management
│   └── utils/
│       ├── email.js       # Email notifications
│       ├── proxy.js       # Proxy support
│       └── ...
├── config.json            # Configuration
├── .env                   # Your credentials (DO NOT SHARE)
├── package.json           # Dependencies
└── screenshots/           # Auto-generated screenshots
```

---

## 🔐 Security & Privacy

### Keep Your Credentials Safe:

1. **Never share your `.env` file**
   - Contains your DVSA credentials
   - Contains email passwords
   - Already in `.gitignore`

2. **Use App Passwords for Gmail**
   - Not your main Gmail password
   - Can be revoked anytime
   - More secure

3. **Screenshots contain personal info**
   - Stored locally in `screenshots/`
   - Not uploaded anywhere
   - Delete periodically if needed

---

## 🚀 Advanced Setup (Optional)

### Enable Browser Rotation

Randomly rotate between Chrome, Edge, and Firefox:

**config.json:**
```json
{
  "session": {
    "browserRotation": {
      "enabled": true,
      "browsers": ["chrome", "edge", "firefox"],
      "randomize": true
    }
  }
}
```

**Requirements:**
- Chrome: ✅ Installed automatically
- Edge: Install from https://www.microsoft.com/edge
- Firefox: Install from https://www.mozilla.org/firefox

---

### Enable Proxy (Recommended for Production)

Reduces detection and blocking:

**Step 1: Choose a Proxy Provider**

| Provider | Price | Setup Time | Best For |
|----------|-------|------------|----------|
| **Smartproxy** | £75/month | 5 minutes | Easiest, no KYC |
| **Bright Data** | £300/month | 24-48 hours | Most reliable, requires KYC |
| **VPN** | £10/month | 2 minutes | Testing only |

**Step 2: Configure Proxy**

Edit `config.json`:
```json
{
  "session": {
    "proxy": {
      "enabled": true,
      "provider": "smartproxy"
    }
  }
}
```

Edit `.env`:
```env
PROXY_PROVIDER=smartproxy
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=user-YOUR_USERNAME
PROXY_PASSWORD=YOUR_PASSWORD
```

**See:** `SESSION_CONFIGURATION.md` for detailed proxy setup

---

## 📚 Additional Documentation

- **SESSION_CONFIGURATION.md** - Browser rotation and proxy setup
- **PROXY_TROUBLESHOOTING.md** - Proxy issues and solutions
- **EMAIL_SETUP_GUIDE.md** - Detailed email configuration
- **README.md** - Full project documentation

---

## 🎓 Usage Tips

### For Best Results:

1. **Start with default settings**
   - Test without proxy first
   - Use 15-minute check interval
   - Keep browser visible (headless: false)

2. **Monitor during peak hours**
   - Slots often released: 6am, 12pm, 6pm
   - Run continuously for best chance

3. **Act fast when notified**
   - Slots get booked quickly
   - Have DVSA website ready
   - Be prepared to book immediately

4. **Be patient**
   - May take days/weeks to find slots
   - System runs 24/7 if you let it
   - You'll be notified immediately when found

---

## ❓ FAQ

### Q: How long does it take to find a slot?

**A:** Varies greatly. Could be hours, days, or weeks depending on:
- Your location
- Test type (car, motorcycle, etc.)
- Time of year
- Cancellations

### Q: Can I run this on multiple computers?

**A:** Yes, but:
- Use different email addresses
- Or use different proxy IPs
- Don't run too many instances (may trigger blocks)

### Q: Will this book the test automatically?

**A:** No. It only **monitors** and **notifies** you. You must book manually when notified.

### Q: Is this legal?

**A:** Yes. It's just automated monitoring of a public website. However:
- Don't abuse it (reasonable check frequency)
- Follow DVSA terms of service
- Use responsibly

### Q: What if I get blocked by DVSA?

**A:** 
1. Wait 1-2 hours
2. Reduce check frequency
3. Enable proxy service
4. See PROXY_TROUBLESHOOTING.md

### Q: Can I monitor multiple bookings?

**A:** Not currently. One booking per instance. You could:
- Run multiple instances with different credentials
- Or modify the code (advanced)

---

## 🆘 Getting Help

### If you're stuck:

1. **Check the logs** - Console output shows what's happening
2. **Check screenshots** - `screenshots/` folder shows what the browser sees
3. **Read documentation** - Comprehensive guides included
4. **Check diagnostics** - Run `npm run test-email` to test email

### Common Commands:

```bash
# Start monitoring
npm start

# Test email configuration
npm run test-email

# Run in collection mode (advanced)
npm run collect

# Check for errors
node --check src/scraper/dvsa.js
```

---

## ✅ Checklist for First Run

Before starting, make sure:

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and filled
- [ ] DVSA credentials correct
- [ ] Email configured (test with `npm run test-email`)
- [ ] `config.json` reviewed (check interval, headless mode)
- [ ] Browser rotation configured (optional)
- [ ] Proxy configured (optional, for production)

---

## 🎉 You're Ready!

Run this command to start:

```bash
npm start
```

The system will:
- ✅ Open a browser
- ✅ Login to DVSA
- ✅ Check for available slots
- ✅ Email you when found
- ✅ Repeat every 15 minutes

**Good luck finding your test slot!** 🚗💨

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review console logs and screenshots
3. Verify your configuration
4. Test individual components (email, browser, etc.)

**Remember:** This tool monitors and notifies. You still need to book manually when notified!
