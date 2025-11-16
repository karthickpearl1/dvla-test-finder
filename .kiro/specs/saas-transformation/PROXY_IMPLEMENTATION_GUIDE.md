# Proxy Implementation - Quick Start Guide

## TL;DR

**For MVP:** Use NordVPN (£10/month) - No code changes needed
**For Production:** Use Smartproxy (£75/month) - Simple code changes

## Quick Setup

### Option 1: VPN (Easiest - MVP)

**1. Subscribe to NordVPN**
- Go to nordvpn.com
- Subscribe (£10/month)
- Download and install

**2. Connect to UK Server**
```bash
# Connect to UK
nordvpn connect uk

# Or specific UK city
nordvpn connect uk london
nordvpn connect uk manchester
```

**3. Run Your Service**
```bash
npm start
```

**4. Rotate IPs (Manual)**
```bash
# Disconnect
nordvpn disconnect

# Connect to different UK server
nordvpn connect uk birmingham

# Restart service
npm start
```

**That's it!** No code changes needed.

### Option 2: Residential Proxy (Production)

**1. Subscribe to Smartproxy**
- Go to smartproxy.com
- Subscribe (starts at £75/month)
- Get credentials from dashboard

**2. Add to .env**
```env
# Proxy Configuration
PROXY_ENABLED=true
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USER=your-username
PROXY_PASS=your-password
```

**3. Create Proxy Module**

Create `src/utils/proxy.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

export function getProxyConfig() {
  if (process.env.PROXY_ENABLED !== 'true') {
    return null;
  }
  
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;
  const user = process.env.PROXY_USER;
  const pass = process.env.PROXY_PASS;
  
  const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
  
  return {
    args: [`--proxy-server=${proxyUrl}`]
  };
}
```

**4. Update Browser Init**

Update `src/scraper/browser.js`:
```javascript
import { getProxyConfig } from '../utils/proxy.js';

export async function initBrowser(config) {
  const proxyConfig = getProxyConfig();
  
  const launchOptions = {
    headless: config.monitoring?.headless ?? false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      ...(proxyConfig?.args || [])  // Add proxy here
    ]
  };
  
  const browser = await puppeteerExtra.launch(launchOptions);
  // ... rest of code
}
```

**5. Test**
```bash
npm start
```

**Done!** Each request now uses a different UK residential IP automatically.

## Cost Breakdown

| Phase | Solution | Cost/Month | Users Supported |
|-------|----------|------------|-----------------|
| Development | No Proxy | £0 | 1 (you) |
| MVP | NordVPN | £10 | 10-20 |
| Production | Smartproxy | £75-200 | 100-500 |
| Scale | Bright Data | £300-500 | 1000+ |

## Recommended Providers

### For MVP (£10/month)
- **NordVPN** - nordvpn.com
- **ExpressVPN** - expressvpn.com
- **Mullvad** - mullvad.net

### For Production (£75-200/month)
- **Smartproxy** ⭐ - smartproxy.com (RECOMMENDED)
- **IPRoyal** - iproyal.com (Budget option)
- **Oxylabs** - oxylabs.io (Premium)

### For Scale (£300-500/month)
- **Bright Data** - brightdata.com (Best quality)
- **Oxylabs** - oxylabs.io (Enterprise)

## Testing Your Proxy

**Test Script:**
```javascript
// test-proxy.js
import puppeteer from 'puppeteer';
import { getProxyConfig } from './src/utils/proxy.js';

async function testProxy() {
  const proxyConfig = getProxyConfig();
  
  const browser = await puppeteer.launch({
    args: proxyConfig?.args || []
  });
  
  const page = await browser.newPage();
  
  // Check IP
  await page.goto('https://api.ipify.org?format=json');
  const content = await page.content();
  const ip = JSON.parse(content.match(/"ip":"([^"]+)"/)[1]);
  
  console.log('Your IP:', ip);
  
  // Check location
  await page.goto('https://ipapi.co/' + ip + '/json/');
  const location = await page.content();
  const country = JSON.parse(location.match(/"country_name":"([^"]+)"/)[1]);
  
  console.log('Country:', country);
  
  if (country === 'United Kingdom') {
    console.log('✅ UK IP confirmed!');
  } else {
    console.log('❌ Not a UK IP!');
  }
  
  await browser.close();
}

testProxy();
```

**Run:**
```bash
node test-proxy.js
```

## Troubleshooting

### Proxy Not Working

**Check:**
1. Credentials correct in .env?
2. PROXY_ENABLED=true?
3. Proxy service active?
4. Firewall blocking?

**Test:**
```bash
# Test proxy directly
curl -x http://user:pass@proxy.smartproxy.com:7000 https://api.ipify.org
```

### Wrong Country IP

**Fix:**
- Add country parameter to proxy URL
- Smartproxy: `http://user:pass@gate.smartproxy.com:7000?country=gb`
- Bright Data: Configure in dashboard

### Slow Performance

**Causes:**
- Proxy server overloaded
- Wrong proxy location
- Network issues

**Fix:**
- Try different proxy server
- Use faster proxy provider
- Check your internet connection

## Next Steps

1. **Start with VPN** (£10/month)
   - Test your service
   - Validate business model
   - No code changes

2. **Upgrade to Smartproxy** (£75/month)
   - When you have 20+ users
   - Implement proxy module
   - Automatic rotation

3. **Scale with Bright Data** (£300/month)
   - When you have 200+ users
   - Add multiple providers
   - Enterprise reliability

## Questions?

**Q: Do I need proxy for development?**
A: No, use your home IP for development.

**Q: When should I add proxy?**
A: When you launch to real users (10+ users).

**Q: Which provider is best?**
A: Smartproxy for production, Bright Data for scale.

**Q: Can I use free proxies?**
A: No, they're unreliable and often blocked.

**Q: How much will it cost?**
A: £10-75/month for MVP, £200-500/month at scale.

---

**Ready to implement? Let me know which option you want to start with!**
