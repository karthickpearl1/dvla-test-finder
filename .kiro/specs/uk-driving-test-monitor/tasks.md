# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create package.json with required dependencies (puppeteer-extra, puppeteer-extra-plugin-stealth, node-cron, dotenv)
  - Create directory structure (src/, src/scraper/, src/utils/)
  - Set up ES modules configuration
  - Create .gitignore for node_modules, .env, and results
  - _Requirements: 5.1, 9.4_

- [x] 2. Implement configuration management
  - [x] 2.1 Create config.json with delay ranges and monitoring settings
    - Define pageLoad, typing, clicking, and navigation delay ranges
    - Configure monitoring interval, retries, headless mode, and manual intervention timeout
    - Add notification settings and target centres list
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 2.2 Implement configuration loading utility
    - Create src/utils/config.js
    - Implement loadConfig() function to read and parse config.json
    - Implement saveResults() function to persist monitoring results
    - Create results directory if it doesn't exist
    - Generate timestamped filenames for results
    - _Requirements: 5.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.3 Create environment variable template
    - Create .env.example with DVSA_LICENSE_NUMBER and DVSA_BOOKING_REFERENCE placeholders
    - Add documentation comments explaining each variable
    - _Requirements: 9.4_

- [x] 3. Implement delay utilities for human-like behavior
  - [x] 3.1 Create delay calculation functions
    - Implement getRandomDelay(min, max) to calculate random milliseconds
    - Implement randomDelay(min, max) to apply async delays
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Implement typing with delays
    - Create typeWithDelay(page, selector, text, config) function
    - Wait for selector to be available
    - Click on input field
    - Type each character individually with random delays between characters
    - _Requirements: 2.5_

  - [x] 3.3 Implement clicking with delays
    - Create clickWithDelay(page, selector, config) function
    - Wait for selector to be available
    - Apply random delay before clicking
    - Execute click action
    - _Requirements: 2.3_

- [x] 4. Implement browser initialization with stealth configuration
  - [x] 4.1 Set up Puppeteer with stealth plugin
    - Import puppeteer-extra and stealth plugin
    - Apply stealth plugin to puppeteer instance
    - _Requirements: 3.2_

  - [x] 4.2 Configure browser launch options
    - Set headless mode from config
    - Add anti-detection launch arguments (disable-blink-features, disable-infobars, etc.)
    - Configure incognito mode
    - Set window size and maximized state
    - Ignore automation default arguments
    - Set defaultViewport to null for full window
    - _Requirements: 3.1, 3.2_

  - [x] 4.3 Apply additional stealth measures
    - Get or create page from browser
    - Override navigator.platform to 'Win32'
    - Override navigator.hardwareConcurrency to 8
    - Override navigator.deviceMemory to 8
    - Set realistic Windows Chrome user agent
    - Set Accept-Language, Accept-Encoding, and Accept headers
    - _Requirements: 3.3, 3.4_

  - [x] 4.4 Implement browser cleanup
    - Create closeBrowser(browser) function
    - Check if browser exists before closing
    - Close browser gracefully
    - _Requirements: 8.5_

- [x] 5. Implement DVSA login flow
  - [x] 5.1 Create navigation to DVSA website
    - Navigate to https://www.gov.uk/change-driving-test
    - Use domcontentloaded wait condition for faster loading
    - Set 60-second timeout for navigation
    - Add error handling with descriptive messages
    - Apply random page load delay after navigation
    - _Requirements: 1.1, 8.1, 10.2_

  - [x] 5.2 Implement "Start now" button click
    - Use clickWithDelay to click .govuk-button--start selector
    - Wait for navigation after click
    - Apply random page load delay
    - _Requirements: 1.2, 10.2_

  - [x] 5.3 Implement credential entry
    - Type driving licence number into #driving-licence-number field using typeWithDelay
    - Apply random typing delay after licence number
    - Type booking reference into #application-reference-number field using typeWithDelay
    - Apply random typing delay after booking reference
    - _Requirements: 1.3, 1.4, 10.3_

  - [x] 5.4 Implement form submission
    - Use clickWithDelay to submit button[type="submit"]
    - _Requirements: 1.5_

  - [x] 5.5 Implement manual intervention window
    - Display console warning about manual intervention
    - Display instructions for CAPTCHA/verification completion
    - Pause for configurable timeout (30 seconds default)
    - Display message when resuming automation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.4_

- [x] 6. Implement availability checking
  - [x] 6.1 Create availability extraction logic
    - Wait for test centre list selector with timeout
    - Use page.evaluate to extract centre data from DOM
    - Query all test centre item elements
    - Extract centre name from each element
    - Extract available dates array from each element
    - Build array of centre objects with name, dates, and available flag
    - Return extracted data
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 6.2 Implement error handling for availability check
    - Wrap extraction in try-catch block
    - Log errors to console
    - Return empty array on failure
    - _Requirements: 8.2_

- [x] 7. Implement monitoring orchestration
  - [x] 7.1 Create monitor session workflow
    - Load configuration using loadConfig()
    - Display monitoring session start message with delay configuration
    - Initialize browser with stealth configuration
    - Load credentials from environment variables
    - Validate credentials are present
    - Execute login flow
    - Execute availability check
    - Build results object with timestamp, centres, and total count
    - Display results summary to console
    - Save results to disk
    - Display saved filename
    - Return results object
    - _Requirements: 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 10.1, 10.5, 10.6_

  - [x] 7.2 Implement credential validation
    - Check DVSA_LICENSE_NUMBER environment variable exists
    - Check DVSA_BOOKING_REFERENCE environment variable exists
    - Throw descriptive error if either is missing
    - _Requirements: 8.4, 9.3_

  - [x] 7.3 Implement error handling and cleanup
    - Wrap entire workflow in try-catch block
    - Log all errors to console
    - Ensure browser cleanup in finally block
    - Re-throw errors for upstream handling
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 8. Implement scheduling and main entry point
  - [x] 8.1 Create main application entry
    - Load configuration
    - Display application title and startup message
    - _Requirements: 10.1_

  - [x] 8.2 Implement initial check execution
    - Execute runMonitor() immediately on startup
    - Wrap in try-catch to handle errors
    - Log errors without stopping application
    - _Requirements: 6.1_

  - [x] 8.3 Implement periodic scheduling
    - Calculate cron expression from checkIntervalMinutes config
    - Display scheduling message with interval
    - Create cron schedule using node-cron
    - Execute runMonitor() on each scheduled trigger
    - Log timestamp for each scheduled check
    - Wrap scheduled execution in try-catch
    - Continue scheduling despite individual check failures
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 8.4 Set up process lifecycle
    - Display instructions for stopping (Ctrl+C)
    - Keep process running for scheduled checks
    - _Requirements: 6.5_

- [x] 9. Create documentation
  - [x] 9.1 Create README with setup instructions
    - Document feature overview
    - Provide setup steps (install, configure, run)
    - Explain how the system works (flow from start to finish)
    - Document configuration options
    - Explain manual intervention window
    - _Requirements: All requirements (documentation)_

  - [x] 9.2 Document configuration options
    - Explain delay ranges and their purpose
    - Document monitoring interval setting
    - Explain headless mode option
    - Document manual intervention timeout
    - _Requirements: 5.1-5.8_

  - [x] 9.3 Document credential setup
    - Explain .env file creation from .env.example
    - Document required environment variables
    - Provide example values format
    - _Requirements: 9.1, 9.2, 9.4_


## Phase 2: Test Centre Collection Implementation

- [x] 10. Implement CSV management utilities






  - [x] 10.1 Create CSV module with file operations

    - Create src/utils/csv.js
    - Implement initializeCsv(filePath) to create CSV with headers (name, address, postcode, availability, dateCollected)
    - Implement readCentresFromCsv(filePath) to load existing centres into array
    - Implement appendCentreToCsv(filePath, centre) to add new centre row
    - Handle file creation, reading, and appending with proper error handling
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 10.2 Implement duplicate detection logic


    - Create isDuplicateCentre(centre, existingCentres) function
    - Normalize centre name (lowercase, trim, remove special characters)
    - Normalize address for comparison
    - Compare against all existing centres by name and address
    - Return true if match found, false otherwise
    - _Requirements: 15.2_

- [x] 11. Implement UK postcode management






  - [x] 11.1 Create postcode list for UK coverage

    - Create src/utils/postcodes.js
    - Define array of UK postcodes covering major cities and regions
    - Include postcodes for England (40-50), Scotland (10-15), Wales (8-10), Northern Ireland (5-8)
    - Organize by geographic regions
    - _Requirements: 12.1, 12.5_

  - [x] 11.2 Implement geographic distance calculation

    - Create calculateDistance(postcode1, postcode2) function
    - Use simplified distance estimation based on postcode areas
    - Return numeric distance value
    - _Requirements: 12.4_


  - [x] 11.3 Implement next postcode selection

    - Create getNextPostcode(usedPostcodes) function
    - Filter out already used postcodes
    - Calculate distance from all used postcodes
    - Select postcode with maximum minimum distance (furthest from all used)
    - Return next postcode or null if all used
    - _Requirements: 12.4, 12.5_


- [x] 12. Implement notification system for available centres




  - [x] 12.1 Create notification module


    - Create src/utils/notifier.js
    - Implement notifyAvailability(centre) function
    - Display prominent console notification with visual separators
    - Include centre name, address, and availability status
    - Use emojis and formatting for visual distinction
    - _Requirements: 19.1, 19.2, 19.3, 19.4_


  - [x] 12.2 Implement notification tracking

    - Create hasBeenNotified(centre) function using Set or array
    - Track notified centres to avoid duplicate notifications
    - Check before displaying notification
    - _Requirements: 19.5_


- [x] 13. Extend DVSA scraper for centre collection




  - [x] 13.1 Implement navigation to change centre page


    - Add navigateToChangeCentre(page, config) function to dvsa.js
    - Wait for booking details page to load after login
    - Locate "Change test centre" button or link using appropriate selector
    - Click with clickWithDelay for human-like behavior
    - Wait for postcode search page to load
    - Apply random navigation delays
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 17.1_


  - [x] 13.2 Implement postcode search functionality


    - Add searchByPostcode(page, postcode, config) function
    - Locate postcode input field
    - Use typeWithDelay to enter postcode character-by-character
    - Locate and click search/submit button with clickWithDelay
    - Wait for search results to load
    - Apply random delays between actions
    - _Requirements: 12.2, 12.3, 17.2_


  - [x] 13.3 Implement centre details extraction


    - Add extractCentreDetails(page) function
    - Use page.evaluate to query all visible test centre elements
    - Extract centre name from each result
    - Extract address or location information
    - Extract availability status (available/not available)
    - Build array of centre objects with all extracted data
    - Add current timestamp as dateCollected
    - Return array of TestCentre objects
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_


  - [x] 13.4 Implement "Load more results" functionality


    - Add loadMoreResults(page, config) function
    - Check if "Load more results" button exists on page
    - If exists, scroll to button with random scrolling behavior
    - Click button using clickWithDelay
    - Wait for new results to load
    - Return true if more results loaded, false if button not found

    - _Requirements: 14.1, 14.2, 14.3, 17.3, 17.4_

  - [x] 13.5 Implement duplicate detection in results


    - Add detectDuplicates(newCentres, existingCentres) function
    - Compare each new centre against existing centres
    - Use normalized name and address for comparison
    - Count number of duplicates found
    - Return true if duplicates exceed threshold (e.g., 3 consecutive)
    - _Requirements: 14.4, 14.5_


  - [x] 13.6 Implement verification challenge detection


    - Add detectVerificationChallenge(page) function
    - Check for CAPTCHA elements (common selectors)
    - Check for verification prompt text
    - Return true if challenge detected, false otherwise
    - _Requirements: 16.1_


  - [x] 13.7 Implement verification pause handler


    - Add handleVerificationPause(page, config) function
    - Display prominent console notification about verification challenge
    - Show instructions for user to complete verification
    - Pause for configurable timeout from config (verificationTimeout)
    - Keep browser visible and interactive during pause
    - Display countdown or wait message
    - Resume automation after timeout
    - _Requirements: 16.2, 16.3, 16.4, 16.5_

- [x] 14. Implement test centre collector orchestration




  - [x] 14.1 Create collector module structure


    - Create src/collector.js
    - Import required modules (browser, dvsa, csv, postcodes, notifier, config)
    - Set up module exports
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 14.2 Implement single postcode collection


    - Create collectCentresForPostcode(page, postcode, existingCentres, config) function
    - Call searchByPostcode with the postcode
    - Extract initial visible centres
    - Check each centre for availability and notify if found
    - Initialize duplicate counter
    - While "Load more" exists and duplicates below threshold:
      - Click loadMoreResults
      - Extract new centres
      - Check for availability and notify
      - Detect duplicates in new batch
      - Increment duplicate counter if found
      - Check for verification challenge and handle if detected
    - Return array of all collected centres for this postcode
    - _Requirements: 12.2, 12.3, 13.1, 13.2, 13.3, 14.1, 14.2, 14.3, 14.4, 14.5, 16.1, 19.1_

  - [x] 14.3 Implement multi-postcode collection workflow


    - Create processAllPostcodes(page, config) function
    - Initialize CSV file
    - Load existing centres from CSV into memory
    - Get UK postcode list
    - Initialize used postcodes array
    - While postcodes remain:
      - Get next geographically distant postcode
      - Display current progress (postcode X of Y)
      - Collect centres for postcode
      - Filter out duplicate centres
      - Append unique centres to CSV
      - Update in-memory centre list
      - Add postcode to used list
      - Apply random delay before next postcode
    - Return collection statistics
    - _Requirements: 12.4, 12.5, 15.2, 15.3, 15.5, 18.1, 18.2, 18.3_

  - [x] 14.4 Implement main collection entry point


    - Create runCollection() function
    - Load configuration
    - Display collection start message
    - Initialize browser with stealth configuration
    - Load credentials from environment
    - Execute login flow
    - Navigate to change centre page
    - Execute processAllPostcodes
    - Display collection summary (total centres, postcodes, duration)
    - Save final CSV
    - Close browser
    - Return collection results
    - _Requirements: 18.4, 18.5_

  - [x] 14.5 Implement error handling for collection


    - Wrap postcode collection in try-catch
    - Log errors and continue with next postcode on failure
    - Wrap CSV operations in try-catch
    - Ensure browser cleanup in finally block
    - Save partial results on error
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 15. Update configuration for collection mode






  - [x] 15.1 Add collection configuration options

    - Update config.json with collection section
    - Add csvFilePath setting (default: "test-centres.csv")
    - Add maxLoadMoreClicks setting (default: 20)
    - Add duplicateThreshold setting (default: 3)
    - Add verificationTimeout setting (default: 60 seconds)
    - Add postcodeDelay min/max settings
    - _Requirements: 5.1, 14.1, 14.5, 16.4_


  - [x] 15.2 Add postcode configuration options


    - Add postcodes section to config.json
    - Add strategy setting ('geographic' or 'sequential')
    - Add optional customList array for user-defined postcodes
    - _Requirements: 12.1, 12.4_

- [x] 16. Update main entry point for collection mode




  - [x] 16.1 Add mode selection to main entry


    - Update src/index.js to support mode parameter
    - Check for command line argument or environment variable for mode
    - If mode is 'collect', run collection instead of monitoring
    - If mode is 'monitor' or default, run existing monitoring
    - _Requirements: 18.3_

  - [x] 16.2 Implement collection execution

    - Import collector module
    - Call runCollection() when in collection mode
    - Display collection results
    - Exit after collection completes (no scheduling)
    - _Requirements: 18.4, 18.5_

  - [x] 16.3 Update package.json scripts


    - Add "collect" script to run collection mode
    - Keep existing "start" script for monitoring mode
    - Add "monitor" script as alias for "start"
    - _Requirements: 18.3_

- [x] 17. Update documentation for collection feature






  - [x] 17.1 Update README with collection mode

    - Document collection mode purpose and usage
    - Explain how to run collection: npm run collect
    - Describe CSV output format and location
    - Explain postcode strategy and coverage
    - Document expected duration and resource usage
    - _Requirements: 12.1, 12.5, 15.1, 15.4, 18.4, 18.5_


  - [x] 17.2 Document notification system


    - Explain availability notifications during collection
    - Show example notification format
    - Describe when notifications appear
    - _Requirements: 19.2, 19.3, 19.4_




  - [ ] 17.3 Document verification handling
    - Explain verification challenge detection
    - Describe manual intervention process during collection
    - Document timeout settings
    - _Requirements: 16.2, 16.3, 16.4, 16.5_


- [x] 18. Implement email notification system
  - [x] 18.1 Install nodemailer dependency
    - Add nodemailer to package.json dependencies
    - Run npm install to install the package
    - _Requirements: 20.1, 21.1_

  - [x] 18.2 Create email utility module
    - Create src/utils/email.js
    - Implement getTransporter() to initialize nodemailer with SMTP configuration
    - Load EMAIL_USER, EMAIL_PASSWORD, EMAIL_SERVICE from environment variables
    - Support both service-based (Gmail) and custom SMTP configuration
    - _Requirements: 21.1, 21.2, 21.3, 21.5_

  - [x] 18.3 Implement multiple recipient support
    - Create getRecipientEmails() function to parse NOTIFICATION_EMAIL
    - Split comma-separated email addresses
    - Trim whitespace from each address
    - Filter out empty entries
    - Return formatted string for nodemailer
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [x] 18.4 Implement availability email notification
    - Create sendEmailNotification(centre, screenshotPath) function
    - Build HTML email template with gradient header and styling
    - Include centre name, address, postcode, availability status, and dates
    - Add "Book Now" button with direct link to DVSA website
    - Support screenshot attachment parameter
    - Send to all configured recipients
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 18.5 Implement verification challenge email alert
    - Create sendVerificationAlert(mode, screenshotPath) function
    - Build HTML email template for verification alerts
    - Include mode (monitoring/collection), instructions, and timeout info
    - Support screenshot attachment parameter
    - Send to all configured recipients
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

  - [x] 18.6 Implement maintenance mode email alert
    - Create sendMaintenanceAlert(message, mode, screenshotPath) function
    - Build HTML email template for maintenance alerts
    - Include exact maintenance message, restart instructions, and tips
    - Support screenshot attachment parameter
    - Send to all configured recipients
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

  - [x] 18.7 Implement test email command
    - Create sendTestEmail() function
    - Send test email to all configured recipients
    - Display success message with recipient list
    - Handle configuration errors gracefully
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5_

  - [x] 18.8 Update environment variables
    - Add NOTIFICATION_EMAIL to .env and .env.example
    - Add EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD to .env and .env.example
    - Add optional EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE for custom SMTP
    - Document multiple recipient format (comma-separated)
    - _Requirements: 21.4, 22.1_

- [x] 19. Implement screenshot capture system
  - [x] 19.1 Create screenshot utility module
    - Create src/utils/screenshot.js
    - Implement ensureScreenshotsDir() to create screenshots directory
    - Add screenshots/ to .gitignore
    - _Requirements: 24.1_

  - [x] 19.2 Implement screenshot capture function
    - Create takeScreenshot(page, type) function
    - Generate timestamped filename with type identifier
    - Capture full-page screenshot in PNG format
    - Save to screenshots directory
    - Log screenshot file path
    - Return file path for email attachment
    - _Requirements: 23.1, 23.2, 23.3, 24.2, 24.3, 24.4, 24.5_

  - [x] 19.3 Implement viewport screenshot function
    - Create takeViewportScreenshot(page, type) function
    - Capture only visible viewport (faster, smaller file)
    - Use same naming and storage strategy
    - _Requirements: 24.4_

  - [x] 19.4 Implement screenshot cleanup function
    - Create cleanupOldScreenshots(daysToKeep) function
    - Read all files in screenshots directory
    - Delete files older than specified days
    - Log cleanup summary
    - _Requirements: 24.1_

  - [x] 19.5 Implement base64 encoding function
    - Create getScreenshotBase64(filepath) function
    - Read screenshot file
    - Convert to base64 string
    - Return for email embedding
    - _Requirements: 23.5_

- [x] 20. Integrate screenshots with email notifications
  - [x] 20.1 Update sendEmailNotification for screenshots
    - Add screenshotPath parameter
    - Attach screenshot as file with filename 'availability-screenshot.png'
    - Embed screenshot in HTML email body using Content-ID
    - Insert screenshot before "Book Now" button
    - Log attachment path
    - _Requirements: 23.4, 23.5_

  - [x] 20.2 Update sendVerificationAlert for screenshots
    - Add screenshotPath parameter
    - Attach screenshot as file with filename 'verification-screenshot.png'
    - Embed screenshot in HTML email body using Content-ID
    - Insert screenshot before tip box
    - Log attachment path
    - _Requirements: 25.4_

  - [x] 20.3 Update sendMaintenanceAlert for screenshots
    - Add screenshotPath parameter
    - Attach screenshot as file with filename 'maintenance-screenshot.png'
    - Embed screenshot in HTML email body using Content-ID
    - Insert screenshot before tip box
    - Log attachment path
    - _Requirements: 27.3_

- [x] 21. Implement maintenance mode detection
  - [x] 21.1 Create maintenance detection function
    - Add detectMaintenanceMode(page) function to src/scraper/dvsa.js
    - Define maintenance message patterns array
    - Get page text content in lowercase
    - Check for any maintenance pattern match
    - Extract full maintenance message from heading or container elements
    - Return object with isMaintenance boolean and message string
    - _Requirements: 26.1, 26.2, 26.5_

  - [x] 21.2 Integrate maintenance detection in login flow
    - Call detectMaintenanceMode() after clicking "Start now"
    - If maintenance detected, capture screenshot
    - Throw MAINTENANCE_MODE error with message and screenshot path
    - Handle screenshot capture errors gracefully
    - _Requirements: 26.1, 26.3, 26.4_

  - [x] 21.3 Handle maintenance errors in monitor module
    - Catch MAINTENANCE_MODE errors in src/monitor.js
    - Parse error message and screenshot path
    - Display console notification with maintenance message
    - Send email alert with screenshot
    - Close browser gracefully
    - Exit with code 0 (successful termination)
    - _Requirements: 26.4, 27.1, 27.2, 27.3_

  - [x] 21.4 Handle maintenance errors in collector module
    - Catch MAINTENANCE_MODE errors in src/collector.js
    - Parse error message and screenshot path
    - Display console notification with maintenance message
    - Send email alert with screenshot
    - Close browser gracefully
    - Exit with code 0 (successful termination)
    - _Requirements: 26.4, 27.1, 27.2, 27.3_

- [x] 22. Integrate email notifications in monitoring mode
  - [x] 22.1 Update notifier module for email support
    - Import sendEmailNotification from email module
    - Update notifyAvailability() to accept page parameter
    - Capture screenshot before sending notification
    - Call sendEmailNotification() with centre and screenshot path
    - Handle email errors gracefully (log but continue)
    - _Requirements: 28.1, 30.3, 30.4_

  - [x] 22.2 Update monitor module to pass page to notifier
    - Pass page object to notifyAvailability() calls
    - Ensure page is available when checking availability
    - _Requirements: 28.1_

  - [x] 22.3 Add verification detection in monitor module
    - Import detectVerificationChallenge and handleVerificationPause
    - Check for verification after login
    - If detected, call handleVerificationPause with mode 'monitoring'
    - _Requirements: 28.3_

- [x] 23. Integrate email notifications in collection mode
  - [x] 23.1 Update collector to pass page to notifier
    - Pass page object to notifyAvailability() calls in collector
    - Ensure screenshots captured during collection
    - _Requirements: 28.2_

  - [x] 23.2 Update verification handling in collector
    - Pass mode 'collection' to handleVerificationPause
    - Ensure verification emails sent during collection
    - _Requirements: 28.4_

- [x] 24. Enhance verification challenge handling with email
  - [x] 24.1 Update handleVerificationPause function
    - Add mode parameter ('monitoring' or 'collection')
    - Capture screenshot of verification challenge
    - Import and call sendVerificationAlert with mode and screenshot
    - Handle screenshot and email errors gracefully
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [x] 25. Add test email script
  - [x] 25.1 Create test-email.js script
    - Import sendTestEmail from email module
    - Call sendTestEmail() and handle result
    - Display success or failure message
    - Provide configuration instructions on failure
    - Exit with appropriate code
    - _Requirements: 29.1, 29.2, 29.3, 29.4_

  - [x] 25.2 Add test-email npm script
    - Add "test-email": "node test-email.js" to package.json scripts
    - Document in README
    - _Requirements: 29.1_

- [x] 26. Update documentation
  - [x] 26.1 Update README with email setup
    - Add email setup section with Gmail instructions
    - Document multiple recipient configuration
    - Add test email command documentation
    - Document screenshot feature
    - Document maintenance detection
    - _Requirements: 20.1, 22.1, 29.1_

  - [x] 26.2 Create EMAIL_SETUP_GUIDE.md
    - Detailed Gmail setup instructions
    - App password generation steps
    - Multiple recipients section with examples
    - Troubleshooting guide
    - Other email provider configurations
    - _Requirements: 21.1, 22.1_

  - [x] 26.3 Create SCREENSHOT_FEATURE.md
    - Overview of screenshot functionality
    - When screenshots are taken
    - Storage and file management
    - Email integration details
    - Benefits and use cases
    - _Requirements: 23.1, 24.1_

  - [x] 26.4 Create MAINTENANCE_HANDLING.md
    - Overview of maintenance detection
    - Common maintenance messages
    - What happens when detected
    - DVSA maintenance schedule
    - Restart instructions
    - _Requirements: 26.1, 27.1_

  - [x] 26.5 Create MULTIPLE_RECIPIENTS.md
    - Quick start guide
    - Configuration examples
    - How it works (technical details)
    - Use cases
    - Troubleshooting
    - _Requirements: 22.1, 22.2_

  - [x] 26.6 Create VERIFICATION_HANDLING_GUIDE.md
    - How verification detection works
    - Email alert details
    - Best practices to minimize challenges
    - Troubleshooting verification issues
    - Configuration examples
    - _Requirements: 25.1, 25.2_

- [x] 27. Handle optional email configuration
  - [x] 27.1 Add email configuration validation
    - Check if EMAIL_USER and EMAIL_PASSWORD are set
    - Display warning if not configured
    - Return null transporter if missing
    - Allow system to continue without email
    - _Requirements: 30.1, 30.2_

  - [x] 27.2 Add graceful email error handling
    - Wrap email sending in try-catch blocks
    - Log email errors to console
    - Continue operation if email fails
    - Don't crash or stop monitoring
    - _Requirements: 30.3, 30.4_

  - [x] 27.3 Ensure console notifications always work
    - Console notifications independent of email
    - Display console output regardless of email status
    - Provide full information in console
    - _Requirements: 30.5_

- [x] 28. Fix screenshot attachment issues
  - [x] 28.1 Fix error handling in maintenance detection
    - Separate screenshot capture from error throwing
    - Use let variable for screenshot path
    - Catch only screenshot errors, not maintenance error
    - Throw maintenance error with or without screenshot
    - _Requirements: 26.3, 26.4_

  - [x] 28.2 Fix HTML replacement in email templates
    - Replace at specific unique locations instead of first </div>
    - Use distinctive HTML patterns for replacement
    - Insert screenshot before specific sections
    - Add debug logging for attachment
    - _Requirements: 23.4, 23.5_

  - [x] 28.3 Add debug logging
    - Log screenshot path when captured
    - Log when attaching screenshot to email
    - Log recipient email addresses
    - Help troubleshoot future issues
    - _Requirements: 24.5_
