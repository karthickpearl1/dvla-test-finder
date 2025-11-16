# IP Rotation Strategy - UK-Based IPs

## Overview

For a centralized service checking DVSA on behalf of multiple users, IP rotation is **essential** to:
- Avoid rate limiting
- Prevent IP blocking
- Distribute load
- Appear as different users
- Maintain service reliability

## Recommended Approaches

### Option 1: Residential Proxy Service (BEST for Production)

**Recommended Providers:**

1. **Bright Data (formerly Luminati)** ⭐ BEST
   - Largest residential proxy network
   - UK-specific IPs available
   - Rotating IPs automatically
   - Pay-per-GB pricing
   - **Cost:** ~£300-500/month for moderate usage
   - **Pros:** Most reliable, largest pool, automatic rotation
   - **Cons:** Expensive

2. **Smartproxy**
   - Good UK residential proxy pool
   - Easier to use than Bright Data
   - **Cost:** ~£75-200/month
   - **Pros:** Good balance of price/quality
   - **Cons:** Smaller pool than Bright Data

3. **Oxylabs**
   - Enterprise-grade
   - Excellent UK coverage
   - **Cost:** ~£300-600/month
   - **Pros:** Very reliable, good support
   - **Cons:** Expensive, overkill for small scale

4. **IPRoyal**
   - Budget-friendly option
   - UK residential proxies
   - **Cost:** ~£50-150/month
   - **Pros:** Affordable, decent quality
   - **Cons:** Smaller pool, less reliable

**How It Works:**
```javascript
// Using Bright Data example
const puppeteer = require('puppeteer');

const proxyUrl = 'http://username:password@proxy.brightdata.com:22225';

const browser = await puppeteer.launch({
  args: [
    `--proxy-server=${proxyUrl}`,
    '--no-sandbox'
  ]
});

// Each request automatically uses a different UK residential IP
```

### Option 2: VPN Rotation (Good for Development/Small Scale)

**Recommended Providers:**

1. **NordVPN** (with dedicated IPs)
   - Multiple UK servers
   - Can rotate manually
   - **Cost:** ~£10-15/month
   - **Pros:** Cheap, easy to set up
   - **Cons:** Manual rotation, limited IPs

2. **ExpressVPN**
   - Good UK server coverage
   - **Cost:** ~£10/month
   - **Pros:** Fast, reliable
   - **Cons:** Manual rotation

3. **Mullvad**
   - Privacy-focused
   - UK servers available
   - **Cost:** €5/month
   - **Pros:** Very cheap, good privacy
   - **Cons:** Manual rotation

**How It Works:**
```bash
# Connect to different UK VPN servers
openvpn --config uk-london-1.ovpn
# Run your service
# Disconnect and reconnect to different server
openvpn --config uk-manchester-1.ovpn
```

**Limitations:**
- Manual rotation (not automatic)
- Limited number of IPs (10-50 servers)
- All traffic goes through VPN (slower)
- Not suitable for production scale

### Option 3: Cloud Provider IP Rotation (Medium Scale)

**Providers:**

1. **AWS EC2 with Elastic IPs**
   - Spin up multiple EC2 instances in UK regions
   - Each instance = different IP
   - Rotate between instances
   - **Cost:** ~£50-200/month (depending on instances)
   - **Pros:** Full control, scalable
   - **Cons:** Complex setup, IPs are datacenter (not residential)

2. **DigitalOcean Droplets**
   - Multiple droplets in London datacenter
   - Each droplet = different IP
   - **Cost:** ~£20-100/month
   - **Pros:** Simple, cheap
   - **Cons:** Datacenter IPs (easier to detect)

3. **Google Cloud Platform**
   - Similar to AWS
   - UK regions available
   - **Cost:** ~£50-200/month

**How It Works:**
```javascript
// Rotate between multiple server instances
const servers = [
  { ip: '1.2.3.4', port: 3000 },
  { ip: '5.6.7.8', port: 3000 },
  { ip: '9.10.11.12', port: 3000 }
];

let currentServer = 0;

function getNextServer() {
  currentServer = (currentServer + 1) % servers.length;
  return servers[currentServer];
}

// Make request through different server each time
const server = getNextServer();
await makeRequest(server);
```

**Limitations:**
- Datacenter IPs (not residential)
- DVSA may detect and block datacenter IPs
- More complex infrastructure

### Option 4: Tor Network (NOT RECOMMENDED)

**Why NOT:**
- ❌ Very slow
- ❌ Unreliable
- ❌ Exit nodes often blocked
- ❌ Not suitable for production
- ❌ May violate DVSA terms

## Recommended Solution: Hybrid Approach

### For MVP/Development (Low Cost)

**Setup:**
1. **NordVPN** (£10/month) for basic IP rotation
2. Manually rotate between UK servers
3. Use for development and testing

**Code:**
```javascript
// No code changes needed
// Just connect to VPN before running service
```

### For Production (Scalable)

**Setup:**
1. **Smartproxy** (£75-200/month) for residential proxies
2. Automatic IP rotation per request
3. UK-only IPs
4. Fallback to VPN if proxy fails

**Code:**
```javascript
// src/utils/proxy.js

import dotenv from 'dotenv';
dotenv.config();

/**
 * Get proxy configuration for Puppeteer
 * @returns {Object} Proxy configuration
 */
export function getProxyConfig() {
  const proxyEnabled = process.env.PROXY_ENABLED === 'true';
  
  if (!proxyEnabled) {
    return null;
  }
  
  const proxyHost = process.env.PROXY_HOST;
  const proxyPort = process.env.PROXY_PORT;
  const proxyUser = process.env.PROXY_USER;
  const proxyPass = process.env.PROXY_PASS;
  
  if (!proxyHost || !proxyPort) {
    console.log('⚠️  Proxy not configured');
    return null;
  }
  
  const proxyUrl = `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`;
  
  return {
    args: [`--proxy-server=${proxyUrl}`],
    proxyUrl: proxyUrl
  };
}

/**
 * Rotate to next proxy (for services with multiple proxies)
 */
let currentProxyIndex = 0;
const proxyList = process.env.PROXY_LIST ? 
  process.env.PROXY_LIST.split(',') : [];

export function getNextProxy() {
  if (proxyList.length === 0) {
    return getProxyConfig();
  }
  
  const proxy = proxyList[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
  
  const [host, port, user, pass] = proxy.split(':');
  const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
  
  return {
    args: [`--proxy-server=${proxyUrl}`],
    proxyUrl: proxyUrl
  };
}

/**
 * Test proxy connection
 */
export async function testProxy(proxyConfig) {
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      args: proxyConfig.args
    });
    
    const page = await browser.newPage();
    await page.goto('https://api.ipify.org?format=json');
    const content = await page.content();
    const ip = JSON.parse(content).ip;
    
    await browser.close();
    
    console.log(`✅ Proxy working. IP: ${ip}`);
    return true;
  } catch (error) {
    console.error('❌ Proxy test failed:', error.message);
    return false;
  }
}
```

**Update browser.js:**
```javascript
// src/scraper/browser.js

import { getProxyConfig } from '../utils/proxy.js';

export async function initBrowser(config) {
  const proxyConfig = getProxyConfig();
  
  const launchOptions = {
    headless: config.monitoring?.headless ?? false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      ...(proxyConfig?.args || [])
    ]
  };
  
  const browser = await puppeteerExtra.launch(launchOptions);
  
  // ... rest of code
}
```

**Environment Variables:**
```env
# .env

# Proxy Configuration
PROXY_ENABLED=true
PROXY_HOST=proxy.smartproxy.com
PROXY_PORT=10000
PROXY_USER=your-username
PROXY_PASS=your-password

# Multiple proxies (optional)
PROXY_LIST=proxy1.com:10000:user1:pass1,proxy2.com:10000:user2:pass2
```

## Implementation Strategy

### Phase 1: Development (No Proxy)

**Cost:** £0
**Setup:**
- Run without proxy
- Use your home IP
- Test functionality

**Limitations:**
- May get rate limited
- Not suitable for production
- Only for development

### Phase 2: MVP (VPN)

**Cost:** £10/month
**Setup:**
- NordVPN subscription
- Connect to UK servers
- Manually rotate if needed

**Code:**
```bash
# No code changes needed
# Just connect to VPN before running

# Connect to UK server
nordvpn connect uk

# Run service
npm start

# Rotate to different UK server if needed
nordvpn connect uk london
```

**Limitations:**
- Manual rotation
- Limited IPs
- All traffic through VPN

### Phase 3: Production (Residential Proxies)

**Cost:** £75-200/month
**Setup:**
- Smartproxy subscription
- Configure proxy in .env
- Automatic rotation per request

**Code:**
```javascript
// Already implemented in proxy.js above
// Just configure environment variables
```

**Benefits:**
- Automatic rotation
- Residential IPs (harder to detect)
- UK-only IPs
- Scalable

### Phase 4: Scale (Multiple Proxies + Fallback)

**Cost:** £200-500/month
**Setup:**
- Multiple proxy providers
- Fallback logic
- Health monitoring

**Code:**
```javascript
// src/utils/proxy.js (enhanced)

const proxyProviders = [
  {
    name: 'smartproxy',
    host: process.env.SMARTPROXY_HOST,
    port: process.env.SMARTPROXY_PORT,
    user: process.env.SMARTPROXY_USER,
    pass: process.env.SMARTPROXY_PASS,
    priority: 1
  },
  {
    name: 'brightdata',
    host: process.env.BRIGHTDATA_HOST,
    port: process.env.BRIGHTDATA_PORT,
    user: process.env.BRIGHTDATA_USER,
    pass: process.env.BRIGHTDATA_PASS,
    priority: 2
  }
];

export async function getWorkingProxy() {
  for (const provider of proxyProviders) {
    const config = buildProxyConfig(provider);
    const isWorking = await testProxy(config);
    
    if (isWorking) {
      console.log(`✅ Using ${provider.name}`);
      return config;
    }
  }
  
  console.log('⚠️  All proxies failed, using direct connection');
  return null;
}
```

## Cost Comparison

| Solution | Monthly Cost | Pros | Cons | Recommended For |
|----------|-------------|------|------|-----------------|
| **No Proxy** | £0 | Free, simple | Rate limiting, blocking | Development only |
| **VPN (NordVPN)** | £10 | Cheap, easy | Manual rotation, limited IPs | MVP, testing |
| **Smartproxy** | £75-200 | Automatic, residential | Cost | Production (recommended) |
| **Bright Data** | £300-500 | Best quality, largest pool | Expensive | Large scale |
| **Cloud IPs** | £50-200 | Full control | Datacenter IPs, complex | Not recommended |

## Recommended Roadmap

### Month 1-2 (Development)
- **No proxy** - £0/month
- Build and test functionality
- Use your home IP

### Month 3-4 (MVP Launch)
- **NordVPN** - £10/month
- Soft launch to small user base
- Manual IP rotation if needed

### Month 5-6 (Growth)
- **Smartproxy** - £75/month
- Scale to 50-100 users
- Automatic IP rotation

### Month 7+ (Scale)
- **Smartproxy + Bright Data** - £200-500/month
- Scale to 500+ users
- Multiple providers for reliability

## Monitoring & Alerts

**Track:**
1. Proxy success rate
2. IP blocks/bans
3. Response times
4. Cost per request

**Alerts:**
- Proxy failure rate >10%
- IP blocked
- Cost exceeds budget

**Code:**
```javascript
// src/utils/proxy-monitor.js

let proxyStats = {
  requests: 0,
  failures: 0,
  blocks: 0
};

export function recordProxyRequest(success, blocked = false) {
  proxyStats.requests++;
  if (!success) proxyStats.failures++;
  if (blocked) proxyStats.blocks++;
  
  // Alert if failure rate >10%
  const failureRate = proxyStats.failures / proxyStats.requests;
  if (failureRate > 0.1) {
    console.error('🚨 High proxy failure rate:', failureRate);
    // Send alert email
  }
}

export function getProxyStats() {
  return {
    ...proxyStats,
    successRate: 1 - (proxyStats.failures / proxyStats.requests),
    blockRate: proxyStats.blocks / proxyStats.requests
  };
}
```

## Best Practices

### 1. Rotate Intelligently
- Don't rotate on every request (wasteful)
- Rotate after X requests or Y minutes
- Rotate on error/block

### 2. Use UK-Only IPs
- Configure proxy for UK geolocation only
- Verify IP location before use
- DVSA may block non-UK IPs

### 3. Monitor Costs
- Track proxy usage
- Set budget alerts
- Optimize rotation frequency

### 4. Have Fallback
- Multiple proxy providers
- Fallback to VPN if proxies fail
- Graceful degradation

### 5. Test Regularly
- Test proxy connectivity
- Verify IP location
- Check for blocks

## Legal & Ethical Considerations

### Terms of Service
- Check DVSA terms of service
- Ensure proxy usage is allowed
- Don't violate rate limits

### Data Protection
- Proxies see your traffic
- Use reputable providers only
- Encrypt sensitive data

### Fair Usage
- Don't hammer DVSA servers
- Respect rate limits
- Use human-like delays

## Conclusion

**For Your Service:**

**MVP (Month 1-4):**
- Start with **NordVPN** (£10/month)
- Manual rotation
- Test with small user base

**Production (Month 5+):**
- Upgrade to **Smartproxy** (£75-200/month)
- Automatic rotation
- UK residential IPs
- Scale to 100+ users

**Enterprise (Month 12+):**
- Add **Bright Data** (£300-500/month)
- Multiple providers
- Highest reliability
- Scale to 1000+ users

**Total Cost:**
- Year 1: ~£500-1000 (VPN + Smartproxy)
- Year 2: ~£2000-4000 (Smartproxy + Bright Data)

**ROI:**
- With £40K revenue (Year 1), proxy costs are 2.5%
- With £300K revenue (Year 2), proxy costs are 1.3%
- **Well worth it for reliability and scale!**

---

**Ready to implement? I can help you:**
1. Set up proxy module
2. Integrate with existing code
3. Add monitoring and alerts
4. Test with different providers
