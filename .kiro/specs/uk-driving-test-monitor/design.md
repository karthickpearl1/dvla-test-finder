# Design Document

## Overview

The UK Driving Test Centre Monitoring System is a Node.js application that uses Puppeteer with stealth plugins to automate browser interactions with the DVSA website. The system is designed with modularity in mind, separating concerns into distinct modules for browser management, DVSA-specific interactions, utility functions, and configuration management.

The architecture follows a scheduled monitoring pattern where the system performs periodic checks at configurable intervals, with each check consisting of browser initialization, authentication, availability checking, and result persistence.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Main Entry Point                     │
│                         (src/index.js)                       │
│                                                              │
│  - Loads configuration                                       │
│  - Schedules periodic monitoring                             │
│  - Handles process lifecycle                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Monitor Module                          │
│                     (src/monitor.js)                         │
│                                                              │
│  - Orchestrates monitoring session                           │
│  - Manages browser lifecycle                                 │
│  - Coordinates login and availability checking               │
│  - Persists results                                          │
└──────┬────────────────────────┬─────────────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────────┐    ┌──────────────────────────────────┐
│  Browser Module  │    │      DVSA Scraper Module         │
│ (browser.js)     │    │      (dvsa.js)                   │
│                  │    │                                  │
│ - Initialize     │    │ - Login flow                     │
│ - Stealth config │    │ - Availability checking          │
│ - Anti-detection │    │ - Page navigation                │
└──────────────────┘    └──────────────────────────────────┘
       │                        │
       └────────┬───────────────┘
                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Utility Modules                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────┐     │
│  │  Delay Utils     │         │  Config Utils        │     │
│  │  (delay.js)      │         │  (config.js)         │     │
│  │                  │         │                      │     │
│  │ - Random delays  │         │ - Load config        │     │
│  │ - Typing delays  │         │ - Save results       │     │
│  │ - Click delays   │         │ - File management    │     │
│  └──────────────────┘         └──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Browser Automation**: Puppeteer Extra with Stealth Plugin
- **Scheduling**: node-cron
- **Configuration**: JSON files and environment variables
- **Data Persistence**: JSON file storage

## Components and Interfaces

### 1. Main Entry Point (src/index.js)

**Purpose**: Application bootstrap and scheduling coordinator

**Responsibilities**:
- Load system configuration
- Execute initial monitoring check
- Schedule periodic checks using cron expressions
- Handle graceful shutdown

**Key Functions**:
- `main()`: Initializes the application and sets up scheduling

**Dependencies**:
- Monitor module
- Config utility
- node-cron

### 2. Monitor Module (src/monitor.js)

**Purpose**: Orchestrates the complete monitoring workflow

**Responsibilities**:
- Initialize browser with stealth configuration
- Load credentials from environment variables
- Execute login flow
- Check test centre availability
- Save results to disk
- Handle errors and cleanup

**Key Functions**:
- `runMonitor()`: Executes a complete monitoring session

**Interface**:
```javascript
async function runMonitor(): Promise<{
  timestamp: string,
  centres: Array<{
    name: string,
    dates: string[],
    available: boolean
  }>,
  totalAvailable: number
}>
```

**Error Handling**:
- Validates credentials before execution
- Catches and logs all errors
- Ensures browser cleanup in finally block

### 3. Browser Module (src/scraper/browser.js)

**Purpose**: Browser initialization and anti-detection configuration

**Responsibilities**:
- Launch Puppeteer with stealth plugin
- Configure incognito mode
- Set realistic browser properties
- Apply anti-detection measures
- Manage browser lifecycle

**Key Functions**:
- `initBrowser(config)`: Initializes and configures browser
- `closeBrowser(browser)`: Safely closes browser instance

**Interface**:
```javascript
async function initBrowser(config: Config): Promise<{
  browser: Browser,
  page: Page
}>

async function closeBrowser(browser: Browser): Promise<void>
```

**Anti-Detection Techniques**:
1. Puppeteer Extra Stealth Plugin (automatic evasions)
2. Incognito mode for clean sessions
3. Realistic user agent (Windows Chrome)
4. Custom navigator properties (platform, hardwareConcurrency, deviceMemory)
5. Proper HTTP headers (Accept-Language, Accept-Encoding)
6. Disabled automation flags
7. Maximized window with realistic dimensions

### 4. DVSA Scraper Module (src/scraper/dvsa.js)

**Purpose**: DVSA-specific website interactions

**Responsibilities**:
- Navigate to DVSA change test page
- Execute login flow with human-like delays
- Handle manual intervention window
- Extract availability data from page
- Parse test centre information

**Key Functions**:
- `login(page, credentials, config)`: Performs login sequence
- `checkAvailability(page, config)`: Extracts availability data

**Interface**:
```javascript
async function login(
  page: Page,
  credentials: {
    licenseNumber: string,
    bookingReference: string
  },
  config: Config
): Promise<void>

async function checkAvailability(
  page: Page,
  config: Config
): Promise<Array<{
  name: string,
  dates: string[],
  available: boolean
}>>
```

**Login Flow**:
1. Navigate to https://www.gov.uk/change-driving-test
2. Wait for page load with random delay
3. Click "Start now" button
4. Wait for navigation
5. Type driving licence number character-by-character
6. Type booking reference character-by-character
7. Submit form
8. Pause for manual intervention (30 seconds default)
9. Resume automation

**Manual Intervention**:
- 30-second pause after form submission
- Console warnings displayed to user
- Browser remains visible and interactive
- Allows CAPTCHA or verification completion

### 5. Delay Utilities (src/utils/delay.js)

**Purpose**: Human-like interaction timing

**Responsibilities**:
- Generate random delays within ranges
- Apply delays between actions
- Simulate human typing speed
- Add realistic click delays

**Key Functions**:
- `getRandomDelay(min, max)`: Calculates random delay in milliseconds
- `randomDelay(min, max)`: Applies random delay
- `typeWithDelay(page, selector, text, config)`: Types text character-by-character
- `clickWithDelay(page, selector, config)`: Clicks with random delay

**Interface**:
```javascript
function getRandomDelay(min: number, max: number): number

async function randomDelay(min: number, max: number): Promise<void>

async function typeWithDelay(
  page: Page,
  selector: string,
  text: string,
  config: Config
): Promise<void>

async function clickWithDelay(
  page: Page,
  selector: string,
  config: Config
): Promise<void>
```

### 6. Configuration Utilities (src/utils/config.js)

**Purpose**: Configuration and result management

**Responsibilities**:
- Load configuration from JSON file
- Save monitoring results to disk
- Manage results directory
- Generate timestamped filenames

**Key Functions**:
- `loadConfig()`: Loads config.json
- `saveResults(results)`: Saves results to timestamped file

**Interface**:
```javascript
function loadConfig(): Config

function saveResults(results: MonitorResults): string
```

## Data Models

### Configuration Model

```javascript
{
  delays: {
    pageLoad: { min: number, max: number },
    typing: { min: number, max: number },
    clicking: { min: number, max: number },
    navigation: { min: number, max: number }
  },
  monitoring: {
    checkIntervalMinutes: number,
    maxRetries: number,
    headless: boolean,
    manualInterventionTimeout: number
  },
  notification: {
    enabled: boolean,
    methods: string[]
  },
  targetCentres: string[]
}
```

### Credentials Model

```javascript
{
  licenseNumber: string,
  bookingReference: string
}
```

### Test Centre Model

```javascript
{
  name: string,
  dates: string[],
  available: boolean
}
```

### Monitor Results Model

```javascript
{
  timestamp: string,  // ISO 8601 format
  centres: TestCentre[],
  totalAvailable: number
}
```

## Error Handling

### Error Categories

1. **Configuration Errors**
   - Missing config.json
   - Invalid JSON format
   - Missing required fields

2. **Credential Errors**
   - Missing environment variables
   - Invalid credential format

3. **Browser Errors**
   - Failed to launch browser
   - Page navigation timeout
   - Element not found

4. **Network Errors**
   - Connection timeout
   - DNS resolution failure
   - HTTP errors

### Error Handling Strategy

**At Browser Level**:
- Wrap navigation in try-catch with timeout
- Log navigation errors with details
- Throw errors up to monitor level

**At Monitor Level**:
- Catch all errors from browser and scraper
- Log errors to console
- Ensure browser cleanup in finally block
- Return empty results on failure
- Continue scheduling despite errors

**At Application Level**:
- Catch errors from scheduled checks
- Log errors without stopping scheduler
- Allow next scheduled check to proceed

### Retry Logic

- Maximum retries configured in config.json
- Currently not implemented but designed for future enhancement
- Would retry failed checks before logging error

## Testing Strategy

### Manual Testing Approach

Given the nature of web scraping and anti-detection requirements, the primary testing approach is manual:

1. **Browser Initialization Testing**
   - Verify incognito mode activation
   - Check stealth plugin effectiveness
   - Validate anti-detection measures

2. **Login Flow Testing**
   - Test with valid credentials
   - Test with invalid credentials
   - Verify manual intervention window
   - Check CAPTCHA handling

3. **Delay Testing**
   - Verify random delays are within configured ranges
   - Check typing appears human-like
   - Validate click delays

4. **Configuration Testing**
   - Test with various delay configurations
   - Test different monitoring intervals
   - Verify headless vs. headed mode

5. **Error Handling Testing**
   - Test with missing credentials
   - Test with network disconnection
   - Test with invalid selectors
   - Verify graceful degradation

### Automated Testing Considerations

While full automated testing is challenging due to:
- Dependency on external website
- Anti-bot detection mechanisms
- Need for real credentials
- CAPTCHA requirements

Potential automated tests could include:
- Unit tests for delay calculation functions
- Unit tests for configuration loading
- Mock-based tests for browser initialization
- Integration tests with mock DVSA responses

### Monitoring and Validation

**Success Indicators**:
- Browser launches without automation flags
- Page loads successfully
- Login completes without blocking
- Results are saved to disk
- Scheduled checks execute on time

**Failure Indicators**:
- Access denied errors
- Navigation timeouts
- Element not found errors
- Missing results files
- Scheduler stops executing

## Security Considerations

### Credential Management

- Credentials stored in .env file (gitignored)
- Environment variables loaded at runtime
- No credentials in code or logs
- Example file provided without real values

### Browser Security

- Incognito mode prevents data persistence
- No cookies saved between sessions
- Clean browser state for each run
- Isolated from user's main browser profile

### Rate Limiting

- Configurable delays prevent aggressive scraping
- Monitoring intervals prevent excessive requests
- Human-like behavior reduces detection risk

## Performance Considerations

### Resource Usage

- One browser instance per monitoring session
- Browser closed after each check
- Results stored as lightweight JSON files
- Minimal memory footprint between checks

### Optimization Opportunities

1. **Browser Reuse**: Keep browser open between checks (trade-off: detection risk)
2. **Parallel Checking**: Check multiple centres simultaneously
3. **Incremental Results**: Only save when changes detected
4. **Result Compression**: Archive old results

### Scalability

Current design supports:
- Single user monitoring
- Multiple target centres
- Configurable check frequency
- Long-running monitoring sessions

Future enhancements could support:
- Multiple user credentials
- Distributed monitoring
- Database storage
- Real-time notifications

## Deployment Considerations

### Environment Setup

1. Node.js runtime (v18+ recommended)
2. npm package manager
3. Sufficient disk space for results
4. Stable internet connection

### Configuration

1. Copy .env.example to .env
2. Add real credentials
3. Adjust config.json for desired behavior
4. Create results directory (auto-created)

### Running the System

**Development Mode**:
```bash
npm start
```

**Production Mode**:
- Use process manager (PM2, systemd)
- Enable logging to file
- Set up monitoring alerts
- Configure automatic restarts

### Maintenance

- Regularly review results files
- Monitor disk space usage
- Update dependencies for security
- Adjust delays if detection occurs
- Update selectors if website changes


## Extended Architecture for Test Centre Collection

### Updated High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Main Entry Point                     │
│                         (src/index.js)                       │
│                                                              │
│  - Mode selection (monitoring vs collection)                 │
│  - Schedules periodic monitoring OR runs collection          │
└──────────────────────┬───────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────────────────┐
│  Monitor Module  │      │  Collection Module           │
│  (monitor.js)    │      │  (collector.js)              │
│                  │      │                              │
│  - Periodic      │      │  - Centre discovery          │
│    checks        │      │  - Postcode management       │
│  - Availability  │      │  - CSV persistence           │
└──────────────────┘      └──────────────────────────────┘
          │                         │
          └────────┬────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  DVSA Scraper Module (Enhanced)              │
│                      (src/scraper/dvsa.js)                   │
│                                                              │
│  - Login flow                                                │
│  - Navigate to change centre page                            │
│  - Postcode search                                           │
│  - Extract centre details                                    │
│  - Load more results handling                                │
│  - Duplicate detection                                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────────────────┐
│  CSV Module      │      │  Postcode Module             │
│  (csv.js)        │      │  (postcodes.js)              │
│                  │      │                              │
│  - Read/Write    │      │  - UK postcode list          │
│  - Deduplication │      │  - Geographic distribution   │
│  - Append data   │      │  - Distance calculation      │
└──────────────────┘      └──────────────────────────────┘
```

### New Components

#### 7. Test Centre Collector Module (src/collector.js)

**Purpose**: Orchestrates the test centre collection workflow across multiple postcodes

**Responsibilities**:
- Initialize browser and authenticate
- Iterate through UK postcodes
- Coordinate centre extraction for each postcode
- Manage CSV file updates
- Track collection progress
- Handle verification challenges

**Key Functions**:
- `runCollection()`: Executes complete collection workflow
- `collectCentresForPostcode(page, postcode, config)`: Collects centres for a single postcode
- `processAllPostcodes(page, config)`: Iterates through all postcodes

**Interface**:
```javascript
async function runCollection(): Promise<{
  totalCentres: number,
  totalPostcodes: number,
  csvFilePath: string
}>

async function collectCentresForPostcode(
  page: Page,
  postcode: string,
  config: Config
): Promise<TestCentre[]>
```

**Workflow**:
1. Initialize browser and login
2. Navigate to change centre page
3. For each postcode:
   - Search by postcode
   - Extract visible centres
   - Click "Load more" until duplicates found
   - Save unique centres to CSV
   - Move to next geographically distant postcode
4. Complete when all postcodes processed

#### 8. CSV Management Module (src/utils/csv.js)

**Purpose**: Handle CSV file operations for test centre data

**Responsibilities**:
- Create CSV file with headers
- Read existing CSV data
- Check for duplicate centres
- Append new centre records
- Maintain data integrity

**Key Functions**:
- `initializeCsv(filePath)`: Creates CSV with headers if not exists
- `readCentresFromCsv(filePath)`: Loads existing centres into memory
- `appendCentreToCsv(filePath, centre)`: Adds new centre to CSV
- `isDuplicateCentre(centre, existingCentres)`: Checks for duplicates

**Interface**:
```javascript
function initializeCsv(filePath: string): void

function readCentresFromCsv(filePath: string): TestCentre[]

function appendCentreToCsv(
  filePath: string,
  centre: TestCentre
): void

function isDuplicateCentre(
  centre: TestCentre,
  existingCentres: TestCentre[]
): boolean
```

**CSV Format**:
```csv
name,address,postcode,availability,dateCollected
"London Test Centre","123 Main St","SW1A 1AA","available","2024-01-15T10:30:00Z"
```

#### 9. Postcode Management Module (src/utils/postcodes.js)

**Purpose**: Manage UK postcodes for geographic coverage

**Responsibilities**:
- Provide list of UK postcodes covering all regions
- Calculate geographic distance between postcodes
- Select next postcode that is geographically distant
- Track used postcodes

**Key Functions**:
- `getUkPostcodes()`: Returns array of UK postcodes
- `getNextPostcode(usedPostcodes)`: Selects next distant postcode
- `calculateDistance(postcode1, postcode2)`: Estimates distance

**Interface**:
```javascript
function getUkPostcodes(): string[]

function getNextPostcode(usedPostcodes: string[]): string | null

function calculateDistance(
  postcode1: string,
  postcode2: string
): number
```

**Postcode Strategy**:
- Use major city postcodes as starting points
- Cover all UK regions: England, Scotland, Wales, Northern Ireland
- Ensure geographic distribution to maximize unique centres
- Approximately 50-100 postcodes for full UK coverage

#### 10. Notification Module (src/utils/notifier.js)

**Purpose**: Handle user notifications for available test centres

**Responsibilities**:
- Display prominent console notifications
- Format availability alerts
- Track notified centres to avoid duplicates
- Provide visual distinction for important alerts

**Key Functions**:
- `notifyAvailability(centre)`: Displays availability notification
- `formatAvailabilityMessage(centre)`: Formats notification message
- `hasBeenNotified(centre)`: Checks if already notified

**Interface**:
```javascript
function notifyAvailability(centre: TestCentre): void

function formatAvailabilityMessage(centre: TestCentre): string

function hasBeenNotified(centre: TestCentre): boolean
```

**Notification Format**:
```
🎯 AVAILABILITY FOUND! 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Centre: London Test Centre
Address: 123 Main St, SW1A 1AA
Status: SLOTS AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 11. Enhanced DVSA Scraper Module

**New Functions Added**:

**Navigate to Change Centre**:
```javascript
async function navigateToChangeCentre(
  page: Page,
  config: Config
): Promise<void>
```
- Waits for booking details page
- Locates "Change test centre" button
- Clicks with human-like delay
- Waits for postcode search page

**Search by Postcode**:
```javascript
async function searchByPostcode(
  page: Page,
  postcode: string,
  config: Config
): Promise<void>
```
- Enters postcode character-by-character
- Submits search form
- Waits for results to load

**Extract Centre Details**:
```javascript
async function extractCentreDetails(
  page: Page
): Promise<TestCentre[]>
```
- Queries all visible centre elements
- Extracts name, address, availability status
- Returns array of centre objects

**Load More Results**:
```javascript
async function loadMoreResults(
  page: Page,
  config: Config
): Promise<boolean>
```
- Checks if "Load more" button exists
- Clicks button with delay
- Waits for new results
- Returns true if more results loaded

**Detect Duplicates**:
```javascript
function detectDuplicates(
  newCentres: TestCentre[],
  existingCentres: TestCentre[]
): boolean
```
- Compares new centres against existing
- Returns true if duplicates found

**Detect Verification Challenge**:
```javascript
async function detectVerificationChallenge(
  page: Page
): Promise<boolean>
```
- Checks for CAPTCHA elements
- Checks for verification prompts
- Returns true if challenge detected

**Handle Verification Pause**:
```javascript
async function handleVerificationPause(
  page: Page,
  config: Config
): Promise<void>
```
- Displays notification to user
- Pauses for configurable timeout
- Keeps browser interactive
- Resumes after timeout

## Updated Data Models

### Test Centre Model (Enhanced)

```javascript
{
  name: string,
  address: string,
  postcode: string,
  availability: 'available' | 'not_available' | 'unknown',
  dateCollected: string,  // ISO 8601 timestamp
  distance?: number       // Optional: distance from search postcode
}
```

### Collection Results Model

```javascript
{
  totalCentres: number,
  totalPostcodes: number,
  csvFilePath: string,
  startTime: string,
  endTime: string,
  duration: number  // milliseconds
}
```

### Postcode Search State

```javascript
{
  currentPostcode: string,
  usedPostcodes: string[],
  centresCollected: number,
  duplicatesFound: boolean
}
```

## Updated Configuration

### New Configuration Options

```javascript
{
  // ... existing config ...
  
  collection: {
    csvFilePath: string,           // Path to CSV file
    maxLoadMoreClicks: number,     // Safety limit for "Load more"
    duplicateThreshold: number,    // Number of duplicates before stopping
    verificationTimeout: number,   // Seconds to wait for verification
    postcodeDelay: {              // Delay between postcode searches
      min: number,
      max: number
    }
  },
  
  postcodes: {
    strategy: 'geographic' | 'sequential',  // Selection strategy
    customList: string[]                     // Optional custom postcodes
  }
}
```

## Collection Workflow

### Complete Collection Process

```
1. Initialize
   ├─ Load configuration
   ├─ Initialize CSV file
   ├─ Load existing centres into memory
   └─ Get UK postcode list

2. Browser Setup
   ├─ Launch browser with stealth
   ├─ Login to DVSA
   └─ Navigate to change centre page

3. For Each Postcode
   ├─ Select next geographically distant postcode
   ├─ Search by postcode
   ├─ Extract visible centres
   ├─ Check for available centres and notify user
   ├─ While "Load more" exists AND no duplicates
   │  ├─ Click "Load more" with delay
   │  ├─ Extract new centres
   │  ├─ Check for available centres and notify user
   │  ├─ Check for duplicates
   │  └─ Check for verification challenge
   ├─ Save unique centres to CSV
   ├─ Update in-memory centre list
   └─ Apply delay before next postcode

4. Complete
   ├─ Display collection summary
   ├─ Save final CSV
   └─ Close browser
```

### Duplicate Detection Strategy

**Centre Uniqueness Criteria**:
- Primary: Test centre name + address
- Secondary: Postcode
- Tertiary: Geographic coordinates (if available)

**Duplicate Detection Logic**:
1. Normalize centre name (lowercase, trim, remove special chars)
2. Normalize address
3. Compare against all existing centres
4. If match found, mark as duplicate

**Load More Stopping Condition**:
- Stop when 3 consecutive duplicate centres found
- Or when "Load more" button disappears
- Or when max clicks limit reached (safety)

### Geographic Distribution Strategy

**Postcode Selection Algorithm**:
1. Start with major cities (London, Manchester, Birmingham, etc.)
2. Calculate distance from all used postcodes
3. Select postcode with maximum minimum distance
4. Ensures broad geographic coverage
5. Minimizes duplicate centres

**UK Region Coverage**:
- England: 40-50 postcodes
- Scotland: 10-15 postcodes
- Wales: 8-10 postcodes
- Northern Ireland: 5-8 postcodes

## Error Handling for Collection

### Collection-Specific Errors

**Postcode Search Errors**:
- Invalid postcode format
- No results for postcode
- Search timeout

**Extraction Errors**:
- Missing centre elements
- Malformed data
- Parsing failures

**CSV Errors**:
- File write failures
- Permission errors
- Disk space issues

**Verification Errors**:
- Timeout during verification
- Failed verification
- Multiple verification challenges

### Error Recovery Strategies

**Postcode Level**:
- Log error and skip to next postcode
- Continue collection with remaining postcodes
- Save partial results

**Centre Level**:
- Skip malformed centre data
- Continue with remaining centres
- Log extraction errors

**File Level**:
- Retry file operations
- Create backup before writing
- Validate CSV integrity

## Performance Considerations for Collection

### Collection Duration

**Estimated Time**:
- Per postcode: 2-5 minutes (depending on results)
- Total postcodes: 50-100
- Total duration: 2-8 hours for complete UK coverage

**Optimization Strategies**:
1. Efficient duplicate detection (hash-based)
2. Batch CSV writes
3. Minimal page reloads
4. Smart postcode selection

### Resource Management

**Memory**:
- Keep all centres in memory during collection
- Estimated: 10,000 centres × 500 bytes = 5 MB
- Acceptable for modern systems

**Disk**:
- CSV file size: ~2-5 MB for all UK centres
- Backup files: Additional 2-5 MB
- Total: ~10 MB

**Network**:
- Bandwidth: Minimal (HTML pages only)
- Requests: ~500-1000 total
- Rate limiting: Built-in via human-like delays

## Testing Strategy for Collection

### Collection Testing

**Unit Tests**:
- CSV read/write operations
- Duplicate detection logic
- Postcode distance calculations
- Data normalization

**Integration Tests**:
- Full postcode search flow
- Load more functionality
- CSV persistence
- Duplicate detection in workflow

**Manual Tests**:
- Complete collection run (sample postcodes)
- Verification challenge handling
- CSV data integrity
- Geographic distribution validation

### Test Data

**Mock Centres**:
- Create sample centre data
- Include duplicates for testing
- Various availability statuses

**Mock Postcodes**:
- Small set for testing (5-10)
- Cover different regions
- Known distances

## Security and Compliance

### Data Privacy

- No personal user data collected
- Only public test centre information
- CSV stored locally only
- No data transmission to external services

### Rate Limiting

- Human-like delays prevent aggressive scraping
- Configurable delays between postcodes
- Respects website load
- Verification challenges handled properly

### Terms of Service

- Collection for personal use only
- Respects DVSA website policies
- No commercial use of data
- Responsible automation practices


## Email Notification System

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Notification Trigger Points               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Available    │  │ Verification │  │ Maintenance  │     │
│  │ Slots Found  │  │ Challenge    │  │ Detected     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │  Notifier Module│                       │
│                   │  (notifier.js)  │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│              ┌─────────────┴─────────────┐                 │
│              ▼                           ▼                  │
│     ┌─────────────────┐         ┌─────────────────┐       │
│     │ Screenshot      │         │ Email Module    │       │
│     │ Module          │         │ (email.js)      │       │
│     │ (screenshot.js) │         └────────┬────────┘       │
│     └────────┬────────┘                  │                 │
│              │                           │                 │
│              └───────────┬───────────────┘                 │
│                          ▼                                  │
│                 ┌─────────────────┐                        │
│                 │ Email with      │                        │
│                 │ Screenshot      │                        │
│                 │ Attachment      │                        │
│                 └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 12. Email Module (src/utils/email.js)

**Purpose**: Handle email notifications with screenshot attachments

**Responsibilities**:
- Initialize email transporter with SMTP configuration
- Parse and validate multiple recipient email addresses
- Send availability notifications with screenshots
- Send verification challenge alerts with screenshots
- Send maintenance mode alerts with screenshots
- Embed screenshots in HTML email body
- Attach screenshots as downloadable files

**Key Functions**:

```javascript
function getTransporter(): Transporter | null
// Initializes nodemailer transporter with configuration from environment variables

function getRecipientEmails(): string | null
// Parses NOTIFICATION_EMAIL environment variable
// Supports single email or comma-separated list
// Returns formatted string for nodemailer

async function sendEmailNotification(
  centre: TestCentre,
  screenshotPath: string | null
): Promise<boolean>
// Sends availability notification with screenshot
// Returns true if successful, false otherwise

async function sendVerificationAlert(
  mode: 'monitoring' | 'collection',
  screenshotPath: string | null
): Promise<boolean>
// Sends verification challenge alert with screenshot

async function sendMaintenanceAlert(
  message: string,
  mode: 'monitoring' | 'collection',
  screenshotPath: string | null
): Promise<boolean>
// Sends maintenance mode alert with screenshot

async function sendTestEmail(): Promise<boolean>
// Sends test email to verify configuration
```

**Email Configuration**:
```javascript
{
  service: process.env.EMAIL_SERVICE,      // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,          // Sender email
    pass: process.env.EMAIL_PASSWORD       // App password
  }
}
```

**Multiple Recipients**:
- Accepts comma-separated email list
- Trims whitespace from each address
- Filters empty entries
- Sends to all recipients in "To:" field

**Email Templates**:

1. **Availability Notification**:
   - Subject: "🎯 Driving Test Slot Available - [Centre Name]"
   - HTML formatted with gradient header
   - Centre details (name, address, postcode, dates)
   - Screenshot embedded inline
   - Screenshot attached as file
   - "Book Now" button with direct link

2. **Verification Alert**:
   - Subject: "⚠️ Verification Challenge Detected - Action Required"
   - Instructions for manual completion
   - Screenshot of CAPTCHA/challenge
   - Timeout information
   - Tips for completion

3. **Maintenance Alert**:
   - Subject: "🛑 DVSA Website Maintenance - Service Unavailable"
   - Exact maintenance message from website
   - Screenshot of maintenance page
   - Instructions for restart
   - DVSA maintenance schedule tips

**Screenshot Integration**:
- Screenshots embedded using Content-ID (CID) references
- Also attached as separate files for downloading
- Embedded in HTML before specific sections
- Mobile-friendly responsive images

### 13. Screenshot Module (src/utils/screenshot.js)

**Purpose**: Capture and manage screenshots for email notifications

**Responsibilities**:
- Capture full-page screenshots
- Save screenshots to local directory
- Generate timestamped filenames
- Provide base64 encoding for email embedding
- Clean up old screenshots

**Key Functions**:

```javascript
async function takeScreenshot(
  page: Page,
  type: 'availability' | 'verification' | 'maintenance'
): Promise<string>
// Captures full-page screenshot
// Saves to screenshots/ directory
// Returns file path

async function takeViewportScreenshot(
  page: Page,
  type: string
): Promise<string>
// Captures only visible viewport (faster, smaller)

function cleanupOldScreenshots(daysToKeep: number): void
// Deletes screenshots older than specified days

function getScreenshotBase64(filepath: string): string | null
// Reads screenshot and returns base64 encoding
```

**Screenshot Configuration**:
```javascript
{
  path: 'screenshots/{type}_{timestamp}.png',
  fullPage: true,           // Capture entire page
  type: 'png',             // High quality format
  quality: 100             // Maximum quality
}
```

**File Management**:
- Directory: `screenshots/`
- Naming: `{type}_{ISO-timestamp}.png`
- Format: PNG (lossless, high quality)
- Size: Typically 100-500 KB per screenshot
- Cleanup: Manual or programmatic

**Storage Strategy**:
- Local storage only (not uploaded)
- Added to `.gitignore`
- Can be cleaned up periodically
- Useful for troubleshooting and records

### 14. Maintenance Detection Module

**Purpose**: Detect DVSA website maintenance mode

**Integrated into**: `src/scraper/dvsa.js`

**Key Functions**:

```javascript
async function detectMaintenanceMode(
  page: Page
): Promise<{
  isMaintenance: boolean,
  message: string
}>
// Checks for maintenance message patterns
// Extracts full maintenance message
// Returns detection result and message
```

**Detection Patterns**:
```javascript
const maintenancePatterns = [
  'sorry',
  "i'll be back",
  'be back at',
  'maintenance',
  'temporarily unavailable',
  'service unavailable',
  'under maintenance',
  'scheduled maintenance',
  'system maintenance',
  'currently unavailable'
];
```

**Detection Strategy**:
1. Get full page text content (lowercase)
2. Check for any maintenance pattern
3. If found, extract full message from:
   - Heading elements (h1, h2)
   - Error message containers
   - Alert/notice boxes
   - Main content area
4. Return first 200 characters if specific element not found

**Integration Points**:
- Called after clicking "Start now" in login flow
- Throws `MAINTENANCE_MODE` error if detected
- Error includes message and screenshot path
- Triggers email notification
- Stops process gracefully

### Updated Notifier Module

**Enhanced Responsibilities**:
- Display console notifications (existing)
- Capture screenshots before notifications
- Send email notifications with screenshots
- Track notified centres to avoid duplicates
- Support both monitoring and collection modes

**Updated Interface**:

```javascript
async function notifyAvailability(
  centre: TestCentre,
  page: Page | null
): Promise<void>
// Enhanced to capture screenshot and send email
// Page parameter optional for backward compatibility
```

**Notification Flow**:
1. Check if centre already notified (avoid duplicates)
2. Mark centre as notified
3. Display console notification
4. If page provided:
   - Capture screenshot
   - Send email with screenshot
5. Handle errors gracefully (continue on failure)

## Updated Data Models

### Email Configuration Model

```javascript
{
  service: string,           // Email service provider
  host?: string,            // SMTP host (if not using service)
  port?: number,            // SMTP port
  secure?: boolean,         // Use TLS
  auth: {
    user: string,           // Sender email address
    pass: string            // App password
  }
}
```

### Screenshot Metadata Model

```javascript
{
  path: string,             // File path
  type: string,             // 'availability' | 'verification' | 'maintenance'
  timestamp: string,        // ISO 8601 timestamp
  size: number,            // File size in bytes
  format: 'png'            // Image format
}
```

### Maintenance Detection Result

```javascript
{
  isMaintenance: boolean,   // True if maintenance detected
  message: string          // Extracted maintenance message
}
```

## Updated Error Handling

### Email Errors

**Error Categories**:
1. **Configuration Errors**
   - Missing EMAIL_USER or EMAIL_PASSWORD
   - Invalid email service configuration
   - Missing NOTIFICATION_EMAIL

2. **Sending Errors**
   - SMTP connection failure
   - Authentication failure
   - Recipient address invalid
   - Attachment too large

3. **Screenshot Errors**
   - Failed to capture screenshot
   - File write permission denied
   - Disk space insufficient

**Error Handling Strategy**:
- Log email errors but continue operation
- Console notifications always work
- Email failures don't crash the system
- Display helpful error messages
- Provide configuration guidance

### Maintenance Mode Handling

**Error Flow**:
1. Maintenance detected → Throw `MAINTENANCE_MODE` error
2. Error caught in monitor/collector
3. Parse error message and screenshot path
4. Display console notification
5. Send email alert with screenshot
6. Close browser gracefully
7. Exit with code 0 (successful termination)

**Error Message Format**:
```
MAINTENANCE_MODE: {message}|||{screenshotPath}
```

## Updated Configuration

### Email Configuration

```javascript
{
  // ... existing config ...
  
  email: {
    enabled: boolean,              // Enable/disable email notifications
    service: string,               // Email service (gmail, outlook, etc.)
    host?: string,                // Custom SMTP host
    port?: number,                // Custom SMTP port
    secure?: boolean,             // Use TLS
    from: string,                 // Sender email
    to: string | string[],        // Recipient(s)
    attachScreenshots: boolean    // Include screenshots in emails
  },
  
  screenshots: {
    enabled: boolean,             // Enable/disable screenshots
    directory: string,            // Storage directory
    format: 'png' | 'jpeg',      // Image format
    quality: number,             // JPEG quality (0-100)
    fullPage: boolean,           // Full page vs viewport
    cleanupDays: number          // Auto-cleanup after N days
  }
}
```

### Environment Variables

```bash
# DVSA Credentials
DVSA_LICENSE_NUMBER=your-licence-number
DVSA_BOOKING_REFERENCE=your-booking-reference

# Email Configuration
NOTIFICATION_EMAIL=email1@example.com,email2@example.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Alternative SMTP Configuration
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
```

## Updated Testing Strategy

### Email Testing

**Unit Tests**:
- Email address parsing (single and multiple)
- Email template generation
- Screenshot attachment logic
- Configuration validation

**Integration Tests**:
- Send test email command
- Email with screenshot attachment
- Multiple recipient delivery
- Error handling (invalid config)

**Manual Tests**:
- Test email command: `npm run test-email`
- Verify email received by all recipients
- Check screenshot embedded and attached
- Test with various email providers

### Screenshot Testing

**Unit Tests**:
- Screenshot capture
- File naming and timestamps
- Directory creation
- Cleanup logic

**Integration Tests**:
- Screenshot in notification flow
- Screenshot with email attachment
- Multiple screenshots in sequence
- Error handling (disk full, permissions)

**Manual Tests**:
- Verify screenshots saved to directory
- Check screenshot quality and content
- Test cleanup functionality
- Verify file sizes reasonable

### Maintenance Detection Testing

**Unit Tests**:
- Pattern matching logic
- Message extraction
- Multiple pattern variations

**Integration Tests**:
- Detection in login flow
- Screenshot capture on detection
- Email notification sent
- Graceful process termination

**Manual Tests**:
- Test with actual maintenance page
- Verify email received with screenshot
- Check console output
- Confirm process exits cleanly

## Performance Considerations

### Email Performance

**Sending Time**:
- Without screenshot: ~1-2 seconds
- With screenshot: ~2-5 seconds (depends on size)
- Multiple recipients: Same time (single send operation)

**Optimization**:
- Async email sending (non-blocking)
- Continue operation if email fails
- Batch notifications if multiple centres found

### Screenshot Performance

**Capture Time**:
- Full page: 1-3 seconds
- Viewport only: 0.5-1 second
- Depends on page complexity

**Storage**:
- PNG: 100-500 KB typical
- JPEG: 50-200 KB typical
- Disk space: ~1 MB per 10 screenshots

**Optimization**:
- Use viewport screenshots for faster capture
- JPEG format for smaller files
- Automatic cleanup of old screenshots
- Compress images if needed

## Security Considerations

### Email Security

**Credentials**:
- App passwords instead of regular passwords
- Environment variables (not in code)
- .env file in .gitignore
- No credentials in logs

**Email Content**:
- No sensitive personal data
- Only public test centre information
- Screenshots of public website pages
- Secure SMTP connection (TLS)

**Multiple Recipients**:
- All recipients visible in "To:" field
- Not BCC (blind carbon copy)
- Recipients can see each other
- Consider privacy implications

### Screenshot Security

**Storage**:
- Local storage only
- Not uploaded to external services
- Added to .gitignore
- User controls retention

**Content**:
- Public website content only
- No credentials visible
- No personal information
- Safe to share

## Deployment Considerations

### Email Setup

**Gmail Setup**:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password in EMAIL_PASSWORD
4. Set EMAIL_SERVICE=gmail

**Other Providers**:
1. Get SMTP settings from provider
2. Set EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE
3. Use account credentials

**Testing**:
```bash
npm run test-email
```

### Screenshot Setup

**Directory**:
- Automatically created on first screenshot
- Ensure write permissions
- Monitor disk space usage

**Cleanup**:
- Manual: Delete old screenshots periodically
- Automatic: Implement cleanup cron job
- Recommended: Keep last 7-30 days

### Monitoring

**Email Delivery**:
- Check spam folders initially
- Monitor email logs
- Verify all recipients receiving
- Test with different providers

**Screenshot Storage**:
- Monitor disk space
- Check file permissions
- Verify screenshots captured correctly
- Review quality and content

## Future Enhancements

### Email Enhancements

1. **BCC Support**: Send to recipients without revealing addresses
2. **Email Templates**: Customizable HTML templates
3. **Attachment Limits**: Handle large screenshots
4. **Retry Logic**: Retry failed email sends
5. **Email Queue**: Queue emails for batch sending

### Screenshot Enhancements

1. **Automatic Cleanup**: Scheduled cleanup of old screenshots
2. **Compression**: Reduce file sizes automatically
3. **Cloud Storage**: Optional upload to cloud storage
4. **Annotations**: Add markers or highlights to screenshots
5. **Video Capture**: Record video of availability detection

### Notification Enhancements

1. **SMS Notifications**: Send SMS alerts
2. **Push Notifications**: Browser/mobile push notifications
3. **Webhook Support**: POST to custom webhooks
4. **Slack/Discord**: Integration with messaging platforms
5. **Custom Filters**: Notify only for specific centres or dates
