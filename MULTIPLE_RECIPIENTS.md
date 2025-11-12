# Multiple Email Recipients Guide

## Quick Start

To send notifications to multiple email addresses, simply list them separated by commas in your `.env` file:

```env
NOTIFICATION_EMAIL=email1@example.com,email2@example.com,email3@example.com
```

That's it! All recipients will receive notifications with screenshots.

## Configuration Examples

### Single Recipient (Default)
```env
NOTIFICATION_EMAIL=karthickpearl@gmail.com
```

### Two Recipients
```env
NOTIFICATION_EMAIL=karthickpearl@gmail.com,friend@example.com
```

### Multiple Recipients
```env
NOTIFICATION_EMAIL=you@gmail.com,partner@gmail.com,family@yahoo.com,backup@outlook.com
```

### With Spaces (Also Works)
```env
NOTIFICATION_EMAIL=email1@example.com, email2@example.com, email3@example.com
```

## How It Works

### Behind the Scenes

1. **Parsing:** The system splits the `NOTIFICATION_EMAIL` value by commas
2. **Trimming:** Removes extra whitespace from each email
3. **Validation:** Filters out empty entries
4. **Sending:** Nodemailer sends to all addresses in the "To:" field

### Code Implementation

```javascript
// In src/utils/email.js
function getRecipientEmails() {
  const emailString = process.env.NOTIFICATION_EMAIL;
  
  // Split by comma, trim whitespace, filter empty
  const emails = emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  // Return as comma-separated string
  return emails.join(', ');
}
```

## Features

### ✅ What Works

- **Unlimited recipients** (within email provider limits)
- **All notification types:**
  - Available slot notifications
  - Verification challenge alerts
  - Maintenance mode alerts
- **Screenshots included** for all recipients
- **Same content** for everyone
- **Individual copies** - each recipient gets their own email
- **Flexible formatting** - spaces optional

### ⚠️ Limitations

- **Email provider limits:**
  - Gmail: ~100 recipients per message
  - Outlook: ~500 recipients per message
  - Other providers: varies
- **All recipients visible:**
  - Recipients can see other email addresses in "To:" field
  - Not BCC (blind carbon copy)
- **Same content:**
  - All recipients receive identical emails
  - No personalization per recipient

## Use Cases

### 1. Family Coordination
```env
NOTIFICATION_EMAIL=parent@gmail.com,child@gmail.com,sibling@yahoo.com
```
**Benefit:** Entire family notified when test slots available

### 2. Backup Notifications
```env
NOTIFICATION_EMAIL=primary@gmail.com,backup@outlook.com
```
**Benefit:** Redundancy in case one email fails

### 3. Multiple Devices
```env
NOTIFICATION_EMAIL=personal@gmail.com,work@company.com
```
**Benefit:** Receive notifications on different devices

### 4. Shared Monitoring
```env
NOTIFICATION_EMAIL=learner@gmail.com,instructor@example.com
```
**Benefit:** Both learner and instructor notified

### 5. Group Booking
```env
NOTIFICATION_EMAIL=friend1@gmail.com,friend2@yahoo.com,friend3@outlook.com
```
**Benefit:** Multiple people looking for slots together

## Testing

### Test All Recipients

```bash
npm run test-email
```

**Expected Output:**
```
✅ Email notifications enabled
✅ Test email sent successfully to email1@example.com, email2@example.com, email3@example.com
```

**Check:**
- All recipients should receive the test email
- Each recipient gets their own copy
- All recipients see the same content

### Verify Configuration

Check your `.env` file:
```bash
# Windows
type .env | findstr NOTIFICATION_EMAIL

# Linux/Mac
grep NOTIFICATION_EMAIL .env
```

Should show:
```
NOTIFICATION_EMAIL=email1@example.com,email2@example.com
```

## Troubleshooting

### Some Recipients Not Receiving Emails

**Problem:** Only some recipients receive emails.

**Possible Causes:**
1. Invalid email address format
2. Typo in email address
3. Recipient's spam filter blocking
4. Email provider limits exceeded

**Solutions:**
1. Verify each email address is correct
2. Check for typos (extra spaces, missing @, etc.)
3. Ask recipients to check spam/junk folders
4. Reduce number of recipients if hitting limits

### "NOTIFICATION_EMAIL not set" Error

**Problem:** Error message despite setting multiple emails.

**Possible Causes:**
1. Syntax error in `.env` file
2. Missing quotes around value
3. Special characters in email addresses

**Solutions:**
1. Don't use quotes around the value:
   ```env
   # ❌ Wrong
   NOTIFICATION_EMAIL="email1@example.com,email2@example.com"
   
   # ✅ Correct
   NOTIFICATION_EMAIL=email1@example.com,email2@example.com
   ```

2. Ensure no line breaks:
   ```env
   # ❌ Wrong
   NOTIFICATION_EMAIL=email1@example.com,
                      email2@example.com
   
   # ✅ Correct
   NOTIFICATION_EMAIL=email1@example.com,email2@example.com
   ```

### Recipients See Each Other's Emails

**Problem:** Recipients can see other email addresses.

**Explanation:** This is expected behavior. All recipients are in the "To:" field.

**If you need BCC (blind carbon copy):**
This would require code modification. Currently not supported but could be added as a feature.

### Email Provider Blocking

**Problem:** Email provider rejects message with multiple recipients.

**Solutions:**
1. Reduce number of recipients
2. Check email provider's sending limits
3. Verify all email addresses are valid
4. Contact email provider support

## Advanced Configuration

### Environment-Specific Recipients

Use different recipients for different environments:

**Development (.env.development):**
```env
NOTIFICATION_EMAIL=dev@example.com
```

**Production (.env.production):**
```env
NOTIFICATION_EMAIL=user1@example.com,user2@example.com,user3@example.com
```

### Conditional Recipients

Currently not supported, but you could modify the code to add conditional logic:

```javascript
// Example: Only send to multiple recipients if availability found
if (centre.availability === 'available') {
  // Send to everyone
  recipientEmail = 'email1@example.com,email2@example.com';
} else {
  // Send only to primary
  recipientEmail = 'email1@example.com';
}
```

## Best Practices

### 1. Verify Email Addresses
Always test with `npm run test-email` after adding new recipients.

### 2. Keep List Manageable
Limit to 5-10 recipients for best deliverability.

### 3. Use Valid Addresses
Ensure all email addresses are active and monitored.

### 4. Inform Recipients
Let recipients know they'll receive notifications so they don't mark as spam.

### 5. Check Spam Folders
Ask recipients to check spam on first notification.

### 6. Document Recipients
Keep a note of who's receiving notifications and why.

## Summary

✅ **Easy to configure** - Just comma-separated list in `.env`
✅ **Works with all notifications** - Availability, verification, maintenance
✅ **Screenshots included** - All recipients get attachments
✅ **Flexible** - Add or remove recipients anytime
✅ **Tested** - Use `npm run test-email` to verify

**Example:**
```env
NOTIFICATION_EMAIL=you@gmail.com,partner@gmail.com,friend@example.com
```

That's all you need! 🎉
