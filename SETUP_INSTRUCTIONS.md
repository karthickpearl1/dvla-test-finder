# Quick Setup Instructions

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` with your details:
   ```env
   # Your DVSA credentials
   DVSA_LICENSE_NUMBER=RAMAN858247S99YD
   DVSA_BOOKING_REFERENCE=67011412
   
   # Where to send notifications
   NOTIFICATION_EMAIL=karthickpearl@gmail.com
   
   # Email sending configuration (for Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## Step 3: Get Gmail App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Select "Mail" → "Windows Computer"
4. Click "Generate"
5. Copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in `.env`

## Step 4: Test Email Configuration
```bash
npm run test-email
```

Expected output:
```
✅ Email notifications enabled
✅ Test email sent successfully to karthickpearl@gmail.com
```

Check your inbox for the test email!

## Step 5: Run the System

**Monitoring Mode** (periodic checks):
```bash
npm start
```

**Collection Mode** (discover all UK test centres):
```bash
npm run collect
```

## What Happens Next?

- The system will log into DVSA with your credentials
- It will search for available test slots
- When a slot is found:
  - ✅ Console notification appears
  - 📧 Email sent to `karthickpearl@gmail.com`
  - You can book immediately!

## Troubleshooting

**Email not working?**
- See `EMAIL_SETUP_GUIDE.md` for detailed troubleshooting

**Need help?**
- Check the `README.md` for full documentation
- Verify your `.env` file has all required fields
- Make sure you're using an App Password, not your regular Gmail password

## Security Reminder

✅ `.env` is in `.gitignore` - your credentials are safe
✅ Never share your `.env` file
✅ You can revoke app passwords anytime from Google settings
