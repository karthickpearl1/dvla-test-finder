import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

/**
 * Parse and validate email addresses from environment variable
 * Supports single email or comma-separated list
 * @returns {string|null} Comma-separated email addresses or null
 */
function getRecipientEmails() {
  const emailString = process.env.NOTIFICATION_EMAIL;
  
  if (!emailString) {
    return null;
  }
  
  // Split by comma and trim whitespace
  const emails = emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  if (emails.length === 0) {
    return null;
  }
  
  // Return as comma-separated string (nodemailer accepts this format)
  return emails.join(', ');
}

/**
 * Initialize email transporter with configuration from .env
 * @returns {Object|null} Nodemailer transporter or null if not configured
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if email is configured
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.log('⚠️  Email notifications not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }

  try {
    // Use service-based configuration (e.g., Gmail)
    if (process.env.EMAIL_SERVICE) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    } else {
      // Use custom SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    }

    console.log('✅ Email notifications enabled');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    return null;
  }
}

/**
 * Send email notification for available test centre
 * @param {Object} centre - Test centre object with name, address, availability
 * @param {string} screenshotPath - Optional path to screenshot file
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise
 */
export async function sendEmailNotification(centre, screenshotPath = null) {
  const transporter = getTransporter();
  
  if (!transporter) {
    return false;
  }

  const recipientEmail = getRecipientEmails();
  
  if (!recipientEmail) {
    console.log('⚠️  NOTIFICATION_EMAIL not set in .env');
    return false;
  }

  try {
    // Build email content
    const subject = `🎯 Driving Test Slot Available - ${centre.name || 'Test Centre'}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Test Slot Available!</h1>
        </div>
        
        <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">📍 ${centre.name || 'Unknown Centre'}</h2>
            
            ${centre.address ? `
              <p style="color: #666; font-size: 16px; margin: 10px 0;">
                <strong>📮 Address:</strong><br/>
                ${centre.address}
              </p>
            ` : ''}
            
            ${centre.postcode ? `
              <p style="color: #666; font-size: 16px; margin: 10px 0;">
                <strong>🗺️ Postcode:</strong> ${centre.postcode}
              </p>
            ` : ''}
            
            <p style="color: #666; font-size: 16px; margin: 10px 0;">
              <strong>✅ Status:</strong> 
              <span style="color: #10b981; font-weight: bold;">${centre.availability || 'SLOTS AVAILABLE'}</span>
            </p>
            
            ${centre.dates && centre.dates.length > 0 ? `
              <p style="color: #666; font-size: 16px; margin: 10px 0;">
                <strong>📅 Available Dates:</strong><br/>
                ${centre.dates.join(', ')}
              </p>
            ` : ''}
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">
                ⚡ ACTION REQUIRED: Book this slot immediately!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://www.gov.uk/change-driving-test" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Book Now →
              </a>
            </div>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This notification was sent by UK Driving Test Monitor
          </p>
        </div>
      </div>
    `;

    const textContent = `
🎯 DRIVING TEST SLOT AVAILABLE! 🎯

📍 Centre: ${centre.name || 'Unknown'}
${centre.address ? `📮 Address: ${centre.address}` : ''}
${centre.postcode ? `🗺️ Postcode: ${centre.postcode}` : ''}
✅ Status: ${centre.availability || 'SLOTS AVAILABLE'}
${centre.dates && centre.dates.length > 0 ? `📅 Available Dates: ${centre.dates.join(', ')}` : ''}

⚡ ACTION REQUIRED: Book this slot immediately!

Visit: https://www.gov.uk/change-driving-test
    `.trim();

    // Prepare email options
    const mailOptions = {
      from: `"UK Test Monitor" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    
    // Add screenshot attachment if provided
    if (screenshotPath) {
      console.log(`📎 Attaching screenshot: ${screenshotPath}`);
      mailOptions.attachments = [{
        filename: 'availability-screenshot.png',
        path: screenshotPath,
        cid: 'screenshot@availability'
      }];
      
      // Add screenshot to HTML content before the "Book Now" button
      mailOptions.html = htmlContent.replace(
        '<div style="text-align: center; margin-top: 25px;">',
        `
          <div style="margin: 20px 0; text-align: center;">
            <h3 style="color: #333; font-size: 18px;">📸 Screenshot:</h3>
            <img src="cid:screenshot@availability" style="max-width: 100%; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 10px;" alt="Availability Screenshot" />
          </div>
          
          <div style="text-align: center; margin-top: 25px;">`
      );
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email notification sent to ${recipientEmail} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email notification:', error.message);
    return false;
  }
}

/**
 * Send email notification for website maintenance/downtime
 * @param {string} message - The maintenance message from the website
 * @param {string} mode - 'monitoring' or 'collection'
 * @param {string} screenshotPath - Optional path to screenshot file
 * @returns {Promise<boolean>} True if email sent successfully
 */
export async function sendMaintenanceAlert(message, mode = 'monitoring', screenshotPath = null) {
  const transporter = getTransporter();
  
  if (!transporter) {
    return false;
  }

  const recipientEmail = getRecipientEmails();
  
  if (!recipientEmail) {
    return false;
  }

  try {
    const subject = '🛑 DVSA Website Maintenance - Service Unavailable';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛑 Service Unavailable</h1>
        </div>
        
        <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">⏰ DVSA Website Maintenance</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              The DVSA website is currently unavailable for maintenance during ${mode} mode.
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">
                ${message || 'The service will be back at 6AM'}
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px;">What happened:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>The DVSA website displayed a maintenance message</li>
                <li>The monitoring/collection process has been stopped</li>
                <li>No further checks will be performed until you restart</li>
              </ul>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px;">What to do:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Wait until the service is back online (usually 6AM UK time)</li>
                <li>Restart the monitor: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">npm start</code></li>
                <li>Or restart collection: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">npm run collect</code></li>
              </ul>
            </div>
            
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>💡 Tip:</strong> DVSA typically performs maintenance between midnight and 6AM UK time. Consider running the monitor during daytime hours.
              </p>
            </div>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This alert was sent by UK Driving Test Monitor
          </p>
        </div>
      </div>
    `;

    const textContent = `
🛑 DVSA WEBSITE MAINTENANCE 🛑

The DVSA website is currently unavailable for maintenance during ${mode} mode.

Message: ${message || 'The service will be back at 6AM'}

What happened:
- The DVSA website displayed a maintenance message
- The monitoring/collection process has been stopped
- No further checks will be performed until you restart

What to do:
- Wait until the service is back online (usually 6AM UK time)
- Restart the monitor: npm start
- Or restart collection: npm run collect

💡 Tip: DVSA typically performs maintenance between midnight and 6AM UK time. Consider running the monitor during daytime hours.
    `.trim();

    // Prepare email options
    const mailOptions = {
      from: `"UK Test Monitor" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    
    // Add screenshot attachment if provided
    if (screenshotPath) {
      console.log(`📎 Attaching screenshot: ${screenshotPath}`);
      mailOptions.attachments = [{
        filename: 'maintenance-screenshot.png',
        path: screenshotPath,
        cid: 'screenshot@maintenance'
      }];
      
      // Add screenshot to HTML content before the closing div of the white box
      mailOptions.html = htmlContent.replace(
        '<div style="background: #dbeafe; border-left: 4px solid #2563eb;',
        `
          <div style="margin: 20px 0; text-align: center;">
            <h3 style="color: #333; font-size: 18px;">📸 Screenshot of Maintenance Page:</h3>
            <img src="cid:screenshot@maintenance" style="max-width: 100%; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 10px;" alt="Maintenance Page Screenshot" />
          </div>
          
          <div style="background: #dbeafe; border-left: 4px solid #2563eb;`
      );
    }
    
    await transporter.sendMail(mailOptions);

    console.log(`📧 Maintenance alert sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send maintenance alert:', error.message);
    return false;
  }
}

/**
 * Send email notification for verification challenge
 * @param {string} mode - 'monitoring' or 'collection'
 * @param {string} screenshotPath - Optional path to screenshot file
 * @returns {Promise<boolean>} True if email sent successfully
 */
export async function sendVerificationAlert(mode = 'monitoring', screenshotPath = null) {
  const transporter = getTransporter();
  
  if (!transporter) {
    return false;
  }

  const recipientEmail = getRecipientEmails();
  
  if (!recipientEmail) {
    return false;
  }

  try {
    const subject = '⚠️ Verification Challenge Detected - Action Required';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Verification Required</h1>
        </div>
        
        <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">🔒 CAPTCHA Challenge Detected</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              The DVSA website has presented a verification challenge (CAPTCHA) during ${mode} mode.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">
                ⚡ ACTION REQUIRED: Please complete the verification manually
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px;">What to do:</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Check your computer where the monitor is running</li>
                <li>Look for the browser window (should be visible)</li>
                <li>Complete the CAPTCHA/verification challenge</li>
                <li>The system will automatically resume after 60 seconds</li>
              </ol>
            </div>
            
            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #075985;">
                <strong>💡 Tip:</strong> The browser must remain open and visible for manual intervention.
              </p>
            </div>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This alert was sent by UK Driving Test Monitor
          </p>
        </div>
      </div>
    `;

    const textContent = `
⚠️ VERIFICATION CHALLENGE DETECTED ⚠️

The DVSA website has presented a verification challenge (CAPTCHA) during ${mode} mode.

⚡ ACTION REQUIRED: Please complete the verification manually

What to do:
1. Check your computer where the monitor is running
2. Look for the browser window (should be visible)
3. Complete the CAPTCHA/verification challenge
4. The system will automatically resume after 60 seconds

💡 Tip: The browser must remain open and visible for manual intervention.
    `.trim();

    // Prepare email options
    const mailOptions = {
      from: `"UK Test Monitor" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    
    // Add screenshot attachment if provided
    if (screenshotPath) {
      console.log(`📎 Attaching screenshot: ${screenshotPath}`);
      mailOptions.attachments = [{
        filename: 'verification-screenshot.png',
        path: screenshotPath,
        cid: 'screenshot@verification'
      }];
      
      // Add screenshot to HTML content before the tip box
      mailOptions.html = htmlContent.replace(
        '<div style="background: #e0f2fe; border-left: 4px solid #0284c7;',
        `
          <div style="margin: 20px 0; text-align: center;">
            <h3 style="color: #333; font-size: 18px;">📸 Screenshot of Challenge:</h3>
            <img src="cid:screenshot@verification" style="max-width: 100%; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 10px;" alt="Verification Challenge Screenshot" />
          </div>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0284c7;`
      );
    }
    
    await transporter.sendMail(mailOptions);

    console.log(`📧 Verification alert sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification alert:', error.message);
    return false;
  }
}

/**
 * Send email notification for security block detection
 * @param {Object} blockInfo - Security block information
 * @param {string} actionDescription - Description of action that triggered block
 * @param {string} screenshotPath - Optional path to screenshot file
 * @returns {Promise<boolean>} True if email sent successfully
 */
export async function sendSecurityBlockAlert(blockInfo, actionDescription = 'unknown action', screenshotPath = null) {
  const transporter = getTransporter();
  
  if (!transporter) {
    return false;
  }

  const recipientEmail = getRecipientEmails();
  
  if (!recipientEmail) {
    return false;
  }

  try {
    const details = blockInfo.details || {};
    const subject = '🚨 DVSA Security Block Detected - Automation Stopped';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 Security Block Detected</h1>
        </div>
        
        <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">⛔ Access Denied by DVSA</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              The DVSA website has blocked access to your IP address. The automation has been stopped.
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">
                ⚠️ Triggered by: ${actionDescription}
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333; font-size: 18px;">Block Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; color: #666; font-weight: bold;">Error Number:</td>
                  <td style="padding: 10px; color: #333;">${details.errorNumber || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; color: #666; font-weight: bold;">Timestamp:</td>
                  <td style="padding: 10px; color: #333;">${details.timestamp || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; color: #666; font-weight: bold;">Your IP:</td>
                  <td style="padding: 10px; color: #333;">${details.yourIP || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; color: #666; font-weight: bold;">Proxy IP:</td>
                  <td style="padding: 10px; color: #333;">${details.proxyIP || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; color: #666; font-weight: bold;">Incident ID:</td>
                  <td style="padding: 10px; color: #333;">${details.incidentID || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666; font-weight: bold;">Page URL:</td>
                  <td style="padding: 10px; color: #333; word-break: break-all;">${details.url || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">What to do:</h4>
              <ol style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.8;">
                <li>Wait for some time before retrying (recommended: 1-2 hours)</li>
                <li>Consider using a VPN or proxy service</li>
                <li>Reduce check frequency in config.json</li>
                <li>Contact DVSA if the block persists</li>
              </ol>
            </div>
            
            ${screenshotPath ? `
            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #075985;">
                <strong>📸 Screenshot:</strong> A screenshot of the block page has been attached to this email.
              </p>
            </div>
            ` : ''}
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This alert was sent by UK Driving Test Monitor
          </p>
        </div>
      </div>
    `;

    const textContent = `
🚨 DVSA SECURITY BLOCK DETECTED 🚨

The DVSA website has blocked access to your IP address. The automation has been stopped.

⚠️ Triggered by: ${actionDescription}

Block Details:
─────────────────────────────────────────
Error Number:  ${details.errorNumber || 'N/A'}
Timestamp:     ${details.timestamp || 'N/A'}
Your IP:       ${details.yourIP || 'N/A'}
Proxy IP:      ${details.proxyIP || 'N/A'}
Incident ID:   ${details.incidentID || 'N/A'}
Page URL:      ${details.url || 'N/A'}
─────────────────────────────────────────

What to do:
1. Wait for some time before retrying (recommended: 1-2 hours)
2. Consider using a VPN or proxy service
3. Reduce check frequency in config.json
4. Contact DVSA if the block persists

${screenshotPath ? '📸 A screenshot of the block page has been attached to this email.' : ''}
    `.trim();

    // Prepare email options
    const mailOptions = {
      from: `"UK Test Monitor" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    
    // Add screenshot attachment if provided
    if (screenshotPath) {
      console.log(`📎 Attaching screenshot: ${screenshotPath}`);
      mailOptions.attachments = [{
        filename: 'security-block-screenshot.png',
        path: screenshotPath,
      }];
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Security block alert email sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send security block alert email:', error.message);
    return false;
  }
}

/**
 * Test email configuration by sending a test email
 * @returns {Promise<boolean>} True if test email sent successfully
 */
export async function sendTestEmail() {
  const transporter = getTransporter();
  
  if (!transporter) {
    return false;
  }

  const recipientEmail = getRecipientEmails();
  
  if (!recipientEmail) {
    console.log('⚠️  NOTIFICATION_EMAIL not set in .env');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"UK Test Monitor" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '✅ Email Notifications Configured Successfully',
      text: 'Your email notifications are working! You will receive alerts when test slots become available.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Notifications Configured Successfully</h2>
          <p>Your email notifications are working! You will receive alerts when test slots become available.</p>
        </div>
      `,
    });

    console.log(`✅ Test email sent successfully to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    return false;
  }
}
