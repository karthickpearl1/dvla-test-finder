# Proxy Troubleshooting Guide

## Common Proxy Issues and Solutions

### 1. ERR_CERT_AUTHORITY_INVALID ✅ FIXED

**Error:**
```
❌ Error in login flow: net::ERR_CERT_AUTHORITY_INVALID at https://driverpracticaltest.dvsa.gov.uk/login
```

**Cause:**
Proxy services like Bright Data use SSL interception (man-in-the-middle) to route traffic. Puppeteer rejects the proxy's SSL certificate by default.

**Solution:**
The system now automatically handles this by adding:
- `--ignore-certificate-errors` flag
- `--ignore-certificate-errors-spki-list` flag
- `--allow-insecure-localhost` flag
- `ignoreHTTPSErrors: true` in Puppeteer launch options

**Status:** ✅ Fixed in browser.js

---

### 2. Proxy Connection Failed

**Error:**
```
❌ Proxy connection test failed
```

**Possible Causes:**
1. Invalid credentials
2. Proxy service is down
3. No credits remaining
4. Firewall blocking proxy connection

**Solutions:**

#### Check Credentials
Verify your .env file:
```env
PROXY_PROVIDER=brightdata
PROXY_HOST=brd.superproxy.io
PROXY_PORT=33335
PROXY_USERNAME=brd-customer-hl_5eaa2518-zone-residential_proxy1
PROXY_PASSWORD=u0o5kxa6q05z
```

**Common mistakes:**
- Extra spaces in credentials
- Wrong port number
- Incorrect username format

#### Check Bright Data Dashboard
1. Go to https://brightdata.com
2. Login to your account
3. Check:
   - Account is active
   - Zone is active
   - You have credits remaining
   - No IP restrictions set

#### Test Proxy Manually
Use curl to test:
```bash
curl -x http://brd-customer-hl_5eaa2518-zone-residential_proxy1:u0o5kxa6q05z@brd.superproxy.io:33335 https://lumtest.com/myip.json
```

Should return your proxy IP.

---

### 3. Proxy Authentication Failed

**Error:**
```
❌ Proxy authentication failed: 407 Proxy Authentication Required
```

**Cause:**
Username or password is incorrect.

**Solution:**
1. Double-check credentials in .env
2. Regenerate password in Bright Data dashboard
3. Ensure no special characters are causing issues
4. Try URL-encoding special characters

---

### 4. Proxy Too Slow

**Symptom:**
Pages take very long to load, timeouts occur frequently.

**Causes:**
1. Proxy server overloaded
2. Wrong proxy location (too far from UK)
3. Network issues

**Solutions:**

#### Use UK-based Proxies
For Bright Data, specify UK location in username:
```env
PROXY_USERNAME=brd-customer-hl_5eaa2518-zone-residential_proxy1-country-gb
```

#### Increase Timeouts
In dvsa.js, increase timeout values:
```javascript
await page.goto(DVSA_LOGIN_URL, { 
  waitUntil: 'domcontentloaded',
  timeout: 90000  // Increase from 60000 to 90000
});
```

#### Try Different Proxy Provider
If Bright Data is consistently slow, try:
- Smartproxy (often faster for UK)
- Oxylabs
- Different Bright Data zone

---

### 5. Still Getting Security Blocks with Proxy

**Symptom:**
Even with proxy enabled, DVSA still blocks access.

**Possible Causes:**
1. Using datacenter proxies instead of residential
2. Proxy IP is already blacklisted
3. Too frequent requests
4. Browser fingerprinting detection

**Solutions:**

#### Verify Residential Proxies
Bright Data has different proxy types:
- **Residential** (recommended) - Port 33335
- **Datacenter** (not recommended) - Port 22225
- **Mobile** (best but expensive) - Port 24000

Make sure you're using residential (port 33335).

#### Reduce Request Frequency
In config.json:
```json
{
  "monitoring": {
    "checkIntervalMinutes": 15  // Increase from 2 to 15
  }
}
```

#### Enable All Anti-Detection Features
In config.json:
```json
{
  "session": {
    "browserRotation": {
      "enabled": true,
      "browsers": ["chrome", "edge", "firefox"],
      "randomize": true
    }
  },
  "delays": {
    "pageLoad": { "min": 3, "max": 7 },
    "typing": { "min": 0.2, "max": 0.5 },
    "clicking": { "min": 1, "max": 4 },
    "navigation": { "min": 2, "max": 5 }
  }
}
```

#### Rotate Proxy Sessions
For Bright Data, add session rotation to username:
```env
PROXY_USERNAME=brd-customer-hl_5eaa2518-zone-residential_proxy1-session-rand123
```

Change `rand123` to a new random value each run.

---

### 6. Proxy Costs Too High

**Symptom:**
Bright Data charges are higher than expected.

**Causes:**
1. Too frequent checks
2. Loading unnecessary resources
3. Not using bandwidth optimization

**Solutions:**

#### Reduce Check Frequency
```json
{
  "monitoring": {
    "checkIntervalMinutes": 30  // Check every 30 minutes instead of 2
  }
}
```

**Cost calculation:**
- 2 minutes: ~50MB/hour = 1.2GB/day = £3-5/day
- 15 minutes: ~7MB/hour = 168MB/day = £0.50/day
- 30 minutes: ~3.5MB/hour = 84MB/day = £0.25/day

#### Block Unnecessary Resources
Add to browser.js (advanced):
```javascript
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});
```

#### Use Collection Mode Sparingly
Collection mode uses more bandwidth (searches multiple postcodes).
- Run collection once to build database
- Use monitoring mode for regular checks

---

### 7. Proxy Provider Comparison

If Bright Data isn't working well, consider alternatives:

| Provider | Price | Speed | UK Coverage | Best For |
|----------|-------|-------|-------------|----------|
| **Bright Data** | £300/20GB | Medium | Excellent | Scale, reliability |
| **Smartproxy** | £75/5GB | Fast | Good | Small scale, UK focus |
| **Oxylabs** | £200/10GB | Fast | Excellent | Medium scale |
| **VPN** | £10/month | Fast | Good | Testing, personal use |

**Recommendation for UK DVSA:**
1. **Testing**: VPN (NordVPN, ExpressVPN)
2. **Personal**: Smartproxy (UK residential)
3. **Business**: Bright Data or Oxylabs

---

## Quick Diagnostic Commands

### Test Proxy Connection
```bash
# Test with curl
curl -x http://USERNAME:PASSWORD@HOST:PORT https://lumtest.com/myip.json

# Test with Node.js
node -e "const https = require('https'); const agent = new https.Agent({rejectUnauthorized: false}); https.get({hostname: 'api.ipify.org', path: '/?format=json', agent: new (require('https-proxy-agent'))('http://USERNAME:PASSWORD@HOST:PORT')}, (res) => {let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => console.log(data));})"
```

### Check Bright Data Status
```bash
# Get your IP through proxy
curl -x http://USERNAME:PASSWORD@brd.superproxy.io:33335 https://lumtest.com/myip.json
```

### Test Without Proxy
Temporarily disable proxy in config.json:
```json
{
  "session": {
    "proxy": {
      "enabled": false
    }
  }
}
```

If it works without proxy, the issue is proxy-related.

---

## Best Practices

### 1. Start Without Proxy
Test your setup without proxy first:
```json
"proxy": { "enabled": false }
```

Once working, enable proxy.

### 2. Use Residential Proxies
Always use residential proxies for DVSA:
- Bright Data: Port 33335
- Smartproxy: Residential pool
- Oxylabs: Residential proxies

### 3. Rotate Everything
- Browser rotation: ✅ Enabled
- User agent rotation: ✅ Automatic
- Proxy session rotation: Add to username

### 4. Monitor Costs
Check Bright Data dashboard daily:
- Bandwidth usage
- Cost per day
- Adjust check frequency accordingly

### 5. Be Patient
With proxy:
- Pages load slower (2-5 seconds extra)
- Timeouts may need increasing
- First connection takes longer

---

## Support Contacts

### Bright Data Support
- Dashboard: https://brightdata.com
- Support: support@brightdata.com
- Documentation: https://docs.brightdata.com

### Smartproxy Support
- Dashboard: https://smartproxy.com
- Support: support@smartproxy.com
- Live chat available

### Oxylabs Support
- Dashboard: https://oxylabs.io
- Support: support@oxylabs.io
- Documentation: https://oxylabs.io/resources

---

## Summary

✅ **Certificate errors**: Fixed automatically
✅ **Authentication**: Handled by system
✅ **Connection testing**: Built-in
⚠️ **Costs**: Monitor usage
⚠️ **Speed**: Expect slower page loads
⚠️ **Blocks**: May still occur, reduce frequency

**Most common fix**: Ensure using residential proxies (port 33335 for Bright Data)
