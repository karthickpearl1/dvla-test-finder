import { sendTestEmail } from './src/utils/email.js';

console.log('Testing email configuration...\n');

sendTestEmail()
  .then((success) => {
    if (success) {
      console.log('\n✅ Email test completed successfully!');
      console.log('Check your inbox at the NOTIFICATION_EMAIL address.');
    } else {
      console.log('\n❌ Email test failed.');
      console.log('Please check your .env configuration:');
      console.log('  - EMAIL_USER: Your email address');
      console.log('  - EMAIL_PASSWORD: Your app password (not regular password)');
      console.log('  - EMAIL_SERVICE: gmail (or your email provider)');
      console.log('  - NOTIFICATION_EMAIL: Where to receive notifications');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
