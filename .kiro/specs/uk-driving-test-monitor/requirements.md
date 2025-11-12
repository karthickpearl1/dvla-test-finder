# Requirements Document

## Introduction

The UK Driving Test Centre Monitoring System is an automated tool that monitors the DVSA (Driver and Vehicle Standards Agency) website to check for available driving test appointments at various test centres. The system mimics human behavior to avoid detection, allows for manual intervention when needed (e.g., CAPTCHA), and provides periodic monitoring with configurable intervals and delays.

## Glossary

- **DVSA**: Driver and Vehicle Standards Agency - the UK government agency responsible for driving tests
- **Monitor System**: The automated browser-based application that checks test centre availability
- **Test Centre**: A physical location where driving tests are conducted
- **Booking Reference**: A unique identifier for an existing driving test booking
- **Driving Licence Number**: The user's UK driving licence identification number
- **Human-like Delays**: Random delays within configurable ranges to simulate human interaction
- **Incognito Mode**: Private browsing mode that doesn't save cookies or history
- **Stealth Mode**: Browser configuration that hides automation indicators
- **Manual Intervention Window**: A pause period allowing users to complete CAPTCHA or verification manually

## Requirements

### Requirement 1

**User Story:** As a driving test candidate, I want the system to automatically log into the DVSA website using my credentials, so that I can check for available test appointments without manual login each time.

#### Acceptance Criteria

1. WHEN the Monitor System starts, THE Monitor System SHALL navigate to https://www.gov.uk/change-driving-test
2. WHEN the page loads, THE Monitor System SHALL click the "Start now" button
3. WHEN the login form appears, THE Monitor System SHALL enter the Driving Licence Number into the driving licence number field
4. WHEN the Driving Licence Number is entered, THE Monitor System SHALL enter the Booking Reference into the booking reference field
5. WHEN both credentials are entered, THE Monitor System SHALL submit the login form

### Requirement 2

**User Story:** As a user, I want the system to mimic human behavior with realistic delays, so that the DVSA website does not detect and block automated access.

#### Acceptance Criteria

1. THE Monitor System SHALL apply random delays between page loads within a configurable minimum and maximum range
2. THE Monitor System SHALL apply random delays between typing characters within a configurable minimum and maximum range
3. THE Monitor System SHALL apply random delays between clicking elements within a configurable minimum and maximum range
4. THE Monitor System SHALL apply random delays between navigation actions within a configurable minimum and maximum range
5. WHEN typing text, THE Monitor System SHALL type character-by-character with delays between each character

### Requirement 3

**User Story:** As a user, I want the browser to appear as a normal user-operated browser, so that anti-bot detection systems do not block my access.

#### Acceptance Criteria

1. THE Monitor System SHALL launch the browser in incognito mode
2. THE Monitor System SHALL remove all automation detection indicators from the browser
3. THE Monitor System SHALL set a realistic user agent string matching Windows Chrome browser
4. THE Monitor System SHALL configure browser properties to match a real Windows system
5. THE Monitor System SHALL apply stealth plugin techniques to evade detection

### Requirement 4

**User Story:** As a user, I want to manually complete CAPTCHA or verification challenges when they appear, so that I can proceed with the automated monitoring after human verification.

#### Acceptance Criteria

1. WHEN the login form is submitted, THE Monitor System SHALL pause for a configurable timeout period
2. WHILE the Manual Intervention Window is active, THE Monitor System SHALL keep the browser window visible and interactive
3. WHEN the Manual Intervention Window expires, THE Monitor System SHALL resume automated operation
4. THE Monitor System SHALL display a console message indicating the Manual Intervention Window is active
5. THE Monitor System SHALL display the remaining wait time during the Manual Intervention Window

### Requirement 5

**User Story:** As a user, I want to configure delay ranges and monitoring intervals, so that I can customize the system behavior to my needs.

#### Acceptance Criteria

1. THE Monitor System SHALL load configuration from a JSON configuration file
2. THE Monitor System SHALL support configurable minimum and maximum delay ranges for page loads
3. THE Monitor System SHALL support configurable minimum and maximum delay ranges for typing actions
4. THE Monitor System SHALL support configurable minimum and maximum delay ranges for clicking actions
5. THE Monitor System SHALL support configurable minimum and maximum delay ranges for navigation actions
6. THE Monitor System SHALL support configurable monitoring check interval in minutes
7. THE Monitor System SHALL support configurable Manual Intervention Window timeout in seconds
8. THE Monitor System SHALL support configurable headless mode setting

### Requirement 6

**User Story:** As a user, I want the system to check test centre availability periodically, so that I can be notified when appointments become available without constant manual checking.

#### Acceptance Criteria

1. WHEN the Monitor System starts, THE Monitor System SHALL perform an immediate availability check
2. WHEN the initial check completes, THE Monitor System SHALL schedule periodic checks based on the configured interval
3. WHEN a scheduled check time arrives, THE Monitor System SHALL execute an availability check
4. WHEN an availability check completes, THE Monitor System SHALL log the results to the console
5. THE Monitor System SHALL continue periodic checks until manually stopped by the user

### Requirement 7

**User Story:** As a user, I want the system to save availability results to files, so that I can review historical data and track when appointments become available.

#### Acceptance Criteria

1. WHEN an availability check completes, THE Monitor System SHALL save results to a JSON file
2. THE Monitor System SHALL include a timestamp in each results file
3. THE Monitor System SHALL include the list of available centres in each results file
4. THE Monitor System SHALL include available dates for each centre in each results file
5. THE Monitor System SHALL store results files in a dedicated results directory
6. THE Monitor System SHALL generate unique filenames using timestamps to prevent overwrites

### Requirement 8

**User Story:** As a user, I want the system to handle errors gracefully, so that temporary issues do not crash the monitoring process.

#### Acceptance Criteria

1. WHEN a navigation error occurs, THE Monitor System SHALL log the error message to the console
2. WHEN an availability check fails, THE Monitor System SHALL log the error and return an empty results array
3. WHEN the browser fails to initialize, THE Monitor System SHALL throw an error with a descriptive message
4. WHEN credentials are missing from environment variables, THE Monitor System SHALL throw an error indicating which credentials are missing
5. THE Monitor System SHALL close the browser properly even when errors occur

### Requirement 9

**User Story:** As a user, I want to securely store my credentials in environment variables, so that my sensitive information is not exposed in code or configuration files.

#### Acceptance Criteria

1. THE Monitor System SHALL load the Driving Licence Number from the DVSA_LICENSE_NUMBER environment variable
2. THE Monitor System SHALL load the Booking Reference from the DVSA_BOOKING_REFERENCE environment variable
3. THE Monitor System SHALL validate that required credentials are present before attempting login
4. THE Monitor System SHALL provide an example environment file showing required variables
5. THE Monitor System SHALL not log or display credential values in console output

### Requirement 10

**User Story:** As a user, I want clear console output showing the monitoring progress, so that I can understand what the system is doing at each step.

#### Acceptance Criteria

1. WHEN the Monitor System starts, THE Monitor System SHALL display a startup message
2. WHEN navigating to a page, THE Monitor System SHALL log the navigation action
3. WHEN entering credentials, THE Monitor System SHALL log which field is being filled
4. WHEN the Manual Intervention Window is active, THE Monitor System SHALL display a warning message
5. WHEN availability results are found, THE Monitor System SHALL display the count of available centres
6. WHEN results are saved, THE Monitor System SHALL display the filename of the saved results

### Requirement 11

**User Story:** As a user, I want the system to navigate to the change test centre page after login, so that I can search for test centres by postcode.

#### Acceptance Criteria

1. WHEN the Manual Intervention Window completes, THE Monitor System SHALL wait for the booking details page to load
2. WHEN the booking details page loads, THE Monitor System SHALL locate the "Change test centre" button or link
3. WHEN the "Change test centre" element is found, THE Monitor System SHALL click it with human-like delay
4. WHEN the change centre page loads, THE Monitor System SHALL wait for the postcode search field to appear
5. THE Monitor System SHALL apply random navigation delays between each step

### Requirement 12

**User Story:** As a user, I want the system to search for test centres using UK postcodes, so that I can discover all available test centres across different geographic regions.

#### Acceptance Criteria

1. THE Monitor System SHALL maintain a list of UK postcodes representing different geographic regions
2. WHEN searching for test centres, THE Monitor System SHALL enter a postcode into the search field with character-by-character typing
3. WHEN the postcode is entered, THE Monitor System SHALL submit the search form with human-like delay
4. WHEN selecting the next postcode, THE Monitor System SHALL choose a postcode that is geographically distant from previously used postcodes
5. THE Monitor System SHALL continue searching with different postcodes until all UK regions are covered

### Requirement 13

**User Story:** As a user, I want the system to extract all test centre details from search results, so that I can build a comprehensive database of UK test centres.

#### Acceptance Criteria

1. WHEN search results load, THE Monitor System SHALL extract the test centre name from each result
2. WHEN extracting centre data, THE Monitor System SHALL extract the test centre address or location
3. WHEN extracting centre data, THE Monitor System SHALL extract the availability status indicating if slots are available or not available
4. WHEN extracting centre data, THE Monitor System SHALL extract any additional identifying information for each centre
5. THE Monitor System SHALL store extracted data in memory during the collection process

### Requirement 14

**User Story:** As a user, I want the system to load all available test centres by clicking "Load more results", so that I capture complete data for each geographic region.

#### Acceptance Criteria

1. WHEN search results are displayed, THE Monitor System SHALL check for a "Load more results" button or link
2. WHEN the "Load more results" button exists, THE Monitor System SHALL click it with human-like delay
3. WHEN new results load, THE Monitor System SHALL extract the newly displayed test centres
4. WHEN extracting new centres, THE Monitor System SHALL compare them against previously extracted centres
5. WHEN duplicate centres are detected, THE Monitor System SHALL stop clicking "Load more results" for the current postcode

### Requirement 15

**User Story:** As a user, I want the system to save unique test centres to a CSV file, so that I can use this data for future availability searches.

#### Acceptance Criteria

1. THE Monitor System SHALL create a CSV file to store test centre data
2. WHEN a new test centre is extracted, THE Monitor System SHALL check if it already exists in the CSV file
3. WHEN a test centre is unique, THE Monitor System SHALL append it to the CSV file
4. THE Monitor System SHALL include test centre name, location, and availability status in each CSV row
5. THE Monitor System SHALL maintain the CSV file across multiple postcode searches

### Requirement 16

**User Story:** As a user, I want to be notified when human verification challenges appear during centre collection, so that I can complete them and allow the automation to continue.

#### Acceptance Criteria

1. WHEN a CAPTCHA or verification challenge is detected during centre collection, THE Monitor System SHALL pause automation
2. WHEN automation is paused for verification, THE Monitor System SHALL display a console notification to the user
3. WHEN automation is paused for verification, THE Monitor System SHALL keep the browser visible and interactive
4. WHEN the verification pause begins, THE Monitor System SHALL wait for a configurable timeout period
5. WHEN the timeout expires, THE Monitor System SHALL resume automation and continue centre collection

### Requirement 17

**User Story:** As a user, I want the system to maintain human-like behavior throughout the entire centre collection process, so that the DVSA website does not detect and block the automation.

#### Acceptance Criteria

1. WHEN clicking "Change test centre", THE Monitor System SHALL apply random clicking delays
2. WHEN entering postcodes, THE Monitor System SHALL type character-by-character with random delays
3. WHEN clicking "Load more results", THE Monitor System SHALL apply random clicking delays
4. WHEN scrolling through results, THE Monitor System SHALL apply random scrolling behavior
5. WHEN navigating between postcodes, THE Monitor System SHALL apply random navigation delays

### Requirement 18

**User Story:** As a user, I want the system to continue collecting test centres until all UK regions are covered, so that I have a complete database for availability monitoring.

#### Acceptance Criteria

1. THE Monitor System SHALL track which postcodes have been searched
2. WHEN a postcode search completes, THE Monitor System SHALL select the next geographically distant postcode
3. WHEN all postcodes in the list have been searched, THE Monitor System SHALL complete the collection process
4. WHEN the collection process completes, THE Monitor System SHALL display a summary of total unique centres collected
5. THE Monitor System SHALL save the final CSV file with all collected test centres


### Requirement 19

**User Story:** As a user, I want to be notified immediately when any test centre shows availability during the collection process, so that I can take action on available slots without waiting for the entire collection to complete.

#### Acceptance Criteria

1. WHEN extracting test centre data, THE Monitor System SHALL check the availability status of each centre
2. WHEN a test centre shows available slots, THE Monitor System SHALL display a prominent console notification
3. WHEN a test centre shows available slots, THE Monitor System SHALL include the centre name and location in the notification
4. WHEN a test centre shows available slots, THE Monitor System SHALL mark the notification visually distinct from regular log messages
5. THE Monitor System SHALL continue the collection process after displaying availability notifications


### Requirement 20

**User Story:** As a user, I want to receive email notifications when test slots become available, so that I can be alerted even when I'm away from my computer.

#### Acceptance Criteria

1. THE Monitor System SHALL send email notifications when test centres show available slots
2. THE Monitor System SHALL include test centre name, address, and postcode in email notifications
3. THE Monitor System SHALL include available dates in email notifications when provided
4. THE Monitor System SHALL format email notifications with HTML for better readability
5. THE Monitor System SHALL include a direct link to the DVSA booking website in email notifications

### Requirement 21

**User Story:** As a user, I want to configure email settings in environment variables, so that I can securely set up email notifications without exposing credentials in code.

#### Acceptance Criteria

1. THE Monitor System SHALL load email sender address from EMAIL_USER environment variable
2. THE Monitor System SHALL load email password from EMAIL_PASSWORD environment variable
3. THE Monitor System SHALL load email service provider from EMAIL_SERVICE environment variable
4. THE Monitor System SHALL load recipient email address(es) from NOTIFICATION_EMAIL environment variable
5. THE Monitor System SHALL validate email configuration before attempting to send notifications

### Requirement 22

**User Story:** As a user, I want to send notifications to multiple email addresses, so that I can alert family members or friends when test slots become available.

#### Acceptance Criteria

1. THE Monitor System SHALL accept a comma-separated list of email addresses in NOTIFICATION_EMAIL
2. WHEN multiple email addresses are configured, THE Monitor System SHALL send notifications to all recipients
3. WHEN parsing email addresses, THE Monitor System SHALL trim whitespace from each address
4. WHEN parsing email addresses, THE Monitor System SHALL filter out empty entries
5. THE Monitor System SHALL display the list of recipients when sending email notifications

### Requirement 23

**User Story:** As a user, I want screenshots attached to email notifications, so that I have visual proof of availability, verification challenges, and maintenance messages.

#### Acceptance Criteria

1. WHEN a test slot becomes available, THE Monitor System SHALL capture a screenshot of the availability page
2. WHEN a verification challenge appears, THE Monitor System SHALL capture a screenshot of the challenge
3. WHEN a maintenance message is detected, THE Monitor System SHALL capture a screenshot of the maintenance page
4. WHEN sending email notifications, THE Monitor System SHALL attach the screenshot as a file
5. WHEN sending email notifications, THE Monitor System SHALL embed the screenshot in the email body

### Requirement 24

**User Story:** As a user, I want screenshots saved locally, so that I can review them later and keep records of notifications.

#### Acceptance Criteria

1. THE Monitor System SHALL save screenshots to a dedicated screenshots directory
2. THE Monitor System SHALL name screenshot files with a timestamp and type identifier
3. THE Monitor System SHALL save screenshots in PNG format for high quality
4. THE Monitor System SHALL capture full-page screenshots including all content
5. THE Monitor System SHALL log the screenshot file path when saving

### Requirement 25

**User Story:** As a user, I want to receive email alerts when verification challenges appear, so that I can respond quickly even when away from my computer.

#### Acceptance Criteria

1. WHEN a CAPTCHA or verification challenge is detected, THE Monitor System SHALL send an email alert
2. THE Monitor System SHALL include the mode (monitoring or collection) in the verification alert
3. THE Monitor System SHALL include step-by-step instructions in the verification alert
4. THE Monitor System SHALL attach a screenshot of the verification challenge to the email
5. THE Monitor System SHALL send verification alerts to all configured recipient email addresses

### Requirement 26

**User Story:** As a user, I want the system to detect DVSA website maintenance mode, so that I'm notified when the service is unavailable and the monitoring should be restarted later.

#### Acceptance Criteria

1. THE Monitor System SHALL check for maintenance messages after clicking "Start now"
2. WHEN a maintenance message is detected, THE Monitor System SHALL extract the full maintenance message text
3. WHEN a maintenance message is detected, THE Monitor System SHALL capture a screenshot of the maintenance page
4. WHEN a maintenance message is detected, THE Monitor System SHALL stop the monitoring or collection process gracefully
5. THE Monitor System SHALL detect multiple maintenance message patterns including "sorry", "be back at", "maintenance", "temporarily unavailable", and "service unavailable"

### Requirement 27

**User Story:** As a user, I want to receive email alerts when the DVSA website is in maintenance mode, so that I know when to restart the monitoring system.

#### Acceptance Criteria

1. WHEN maintenance mode is detected, THE Monitor System SHALL send an email alert to all configured recipients
2. THE Monitor System SHALL include the exact maintenance message from the website in the email
3. THE Monitor System SHALL attach a screenshot of the maintenance page to the email
4. THE Monitor System SHALL include instructions on when to restart the system in the email
5. THE Monitor System SHALL include tips about DVSA maintenance schedules in the email

### Requirement 28

**User Story:** As a user, I want email notifications to work in both monitoring and collection modes, so that I receive alerts regardless of which mode I'm running.

#### Acceptance Criteria

1. WHEN running in monitoring mode, THE Monitor System SHALL send email notifications for available slots
2. WHEN running in collection mode, THE Monitor System SHALL send email notifications for available slots
3. WHEN running in monitoring mode, THE Monitor System SHALL send email alerts for verification challenges
4. WHEN running in collection mode, THE Monitor System SHALL send email alerts for verification challenges
5. WHEN running in either mode, THE Monitor System SHALL send email alerts for maintenance detection

### Requirement 29

**User Story:** As a user, I want to test my email configuration, so that I can verify notifications will work before running the actual monitoring.

#### Acceptance Criteria

1. THE Monitor System SHALL provide a test email command
2. WHEN the test email command is executed, THE Monitor System SHALL send a test email to all configured recipients
3. WHEN the test email is sent, THE Monitor System SHALL display a success message with recipient addresses
4. WHEN email configuration is invalid, THE Monitor System SHALL display an error message with configuration instructions
5. THE Monitor System SHALL validate email configuration before sending the test email

### Requirement 30

**User Story:** As a user, I want email notifications to be optional, so that I can run the system with only console notifications if I prefer.

#### Acceptance Criteria

1. WHEN email credentials are not configured, THE Monitor System SHALL display a warning message
2. WHEN email credentials are not configured, THE Monitor System SHALL continue operation with console notifications only
3. WHEN email sending fails, THE Monitor System SHALL log the error but continue operation
4. WHEN email sending fails, THE Monitor System SHALL not crash or stop the monitoring process
5. THE Monitor System SHALL display console notifications regardless of email configuration status
