# Email Notification Setup Guide

This guide will help you configure email notifications for the UK Driving Test Monitor.

## Quick Setup (Gmail)

1. **Copy the example environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file and add your details:**
   ```env
   DVSA_LICENSE_NUMBER=your-licence-number
   DVSA_BOOKING_REFERENCE=your-booking-reference
   NOTIFICATION_EMAIL=karthickpearl@gmail.com
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Generate Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in to your Google account
   - Select "Mail" as the app
   - Select "Windows Computer" (or your device)
   - Click "Generate"
   - Copy the 16-character password
   - Paste it as `EMAIL_PASSWORD` in your `.env` file

4. **Test your configuration:**
   ```bash
   npm run test-email
   ```
   
   You should see:
   ```
   ✅ Email notifications enabled
   ✅ Test email sent successfully to karthickpearl@gmail.com
   ```

5. **Check your inbox** at `karthickpearl@gmail.com` for the test email.

## Multiple Recipients

To send notifications to multiple people (e.g., yourself, family, friends):

### Setup

**Edit your `.env` file:**
```env
# Multiple emails separated by commas
NOTIFICATION_EMAIL=you@gmail.com,friend@example.com,family@example.com
```

### Features

- **All recipients receive the same notifications**
- **Screenshots included** for everyone
- **No limit** on number of recipients (within email provider limits)
- **Spaces are optional** - both formats work:
  ```env
  # With spaces (easier to read)
  NOTIFICATION_EMAIL=email1@example.com, email2@example.com, email3@example.com
  
  # Without spaces (also works)
  NOTIFICATION_EMAIL=email1@example.com,email2@example.com,email3@example.com
  ```

### Testing Multiple Recipients

```bash
npm run test-email
```

All configured email addresses will receive the test email.

### Use Cases

1. **Family coordination** - Notify multiple family members when slots are available
2. **Backup notifications** - Send to multiple email addresses in case one fails
3. **Shared monitoring** - Multiple people monitoring for the same person
4. **Different devices** - Send to both personal and work email

### Example Configurations

**You + Partner:**
```env
NOTIFICATION_EMAIL=you@gmail.com,partner@gmail.com
```

**Family Group:**
```env
NOTIFICATION_EMAIL=parent@gmail.com,child@gmail.com,sibling@yahoo.com
```

**Multiple Accounts:**
```env
NOTIFICATION_EMAIL=personal@gmail.com,work@company.com,mobile@outlook.com
```

### Important Notes

- All recipients see the same email content
- Recipients can see other email addresses in the "To:" field
- Each recipient receives their own copy with attachments
- Email provider limits apply (Gmail: typically 100 recipients per message)

## Troubleshooting

### "Invalid login" or "Authentication failed"

**Problem:** Gmail is rejecting your credentials.

**Solutions:**
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled on your Google account (required for App Passwords)
- Double-check there are no spaces in your app password
- Try generating a new app password

### "NOTIFICATION_EMAIL not set"

**Problem:** The notification email address is missing.

**Solution:**
- Add `NOTIFICATION_EMAIL=karthickpearl@gmail.com` to your `.env` file

### "Email notifications not configured"

**Problem:** Email credentials are missing.

**Solution:**
- Ensure both `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env`
- Run `npm run test-email` to verify

### Email not received

**Possible causes:**
1. Check your spam/junk folder
2. Verify the `NOTIFICATION_EMAIL` address is correct
3. Check Gmail's "Sent" folder to confirm the email was sent
4. Wait a few minutes - email delivery can be delayed

## Other Email Providers

### Outlook/Hotmail

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

Note: Yahoo also requires an app password. Generate at: https://login.yahoo.com/account/security

### Custom SMTP Server

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourprovider.com
EMAIL_PASSWORD=your-password
```

## How It Works

When the system finds an available test slot:

1. **Console notification** appears immediately in your terminal
2. **Email notification** is sent to `NOTIFICATION_EMAIL`
3. Email includes:
   - Test centre name and address
   - Availability status
   - Available dates (if provided)
   - Direct link to book the slot
   - Beautiful HTML formatting

## Disabling Email Notifications

If you don't want email notifications:

1. Simply leave `EMAIL_USER` and `EMAIL_PASSWORD` empty in `.env`
2. Console notifications will still work
3. The system will display: `⚠️ Email notifications not configured`

## Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already in `.gitignore`
- App passwords are safer than using your main password
- You can revoke app passwords anytime from your Google account settings

## Testing

Always test your email configuration before running a collection:

```bash
npm run test-email
```

This ensures you'll receive notifications when real slots become available.

## Support

If you continue to have issues:
1. Check the console output for specific error messages
2. Verify your email provider's SMTP settings
3. Ensure your firewall isn't blocking SMTP connections
4. Try using a different email provider
