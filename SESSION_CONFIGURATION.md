# Session Configuration Guide

## Overview

The UK Driving Test Monitor now supports advanced session configuration with:
- **Browser Rotation**: Randomly rotate between Chrome, Edge, and Firefox
- **Clean Profiles**: Always use fresh browser profiles (no extensions, no cache)
- **Proxy Support**: Universal proxy adapter for any market proxy service

## Browser Rotation

### Configuration

Edit `config.json`:

```json
{
  "session": {
    "browserRotation": {
      "enabled": true,
      "browsers": ["chrome", "edge", "firefox"],
      "randomize": true
    }
  }
}
```

### Options

- **`enabled`**: Enable/disable browser rotation (default: `true`)
- **`browsers`**: Array of browsers to rotate between
  - Available: `"chrome"`, `"edge"`, `"firefox"`
  - Example: `["chrome", "edge"]` - Only rotate between Chrome and Edge
- **`randomize`**: Randomly select browser each session (default: `true`)
  - If `false`, always uses the first browser in the list

### How It Works

1. **Random Selection**: Each time you start monitoring or collection, a random browser is selected
2. **Random User Agent**: A random user agent matching the selected browser is used
3. **Fallback**: If Edge or Firefox fails to launch, automatically falls back to Chrome

### Browser Requirements

- **Chrome**: Installed by default with Puppeteer (no action needed)
- **Edge**: Must be installed on your system
  - Windows: Usually pre-installed
  - Download: https://www.microsoft.com/edge
- **Firefox**: Must be installed on your system
  - Download: https://www.mozilla.org/firefox

### Example Output

```
🚀 PREPARING NEW SESSION
══════════════════════════════════════════════════════════════════════

📋 Session Configuration:
   Browser:     EDGE
   User Agent:  Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
   Proxy:       Disabled

🌐 Launching EDGE browser...
✅ EDGE browser initialized successfully
══════════════════════════════════════════════════════════════════════
```

## Clean Browser Profiles

### Features

Every session starts with a **completely clean browser profile**:

- ✅ No extensions loaded
- ✅ No plugins enabled
- ✅ No cached data
- ✅ No cookies from previous sessions
- ✅ Incognito/Private mode enabled

### Why This Matters

- **Reduces detection**: No extension fingerprints
- **Consistent behavior**: Same starting state every time
- **Better privacy**: No tracking between sessions
- **Faster startup**: No extensions to load

### Implementation

Automatically enabled with these flags:
```javascript
'--disable-extensions',  // Disable all extensions
'--disable-plugins',     // Disable plugins
'--incognito'            // Always use clean profile
```

## Proxy Support

### Universal Proxy Adapter

The system includes a universal proxy adapter that works with **any proxy service**:

- ✅ Smartproxy
- ✅ Bright Data (formerly Luminati)
- ✅ Oxylabs
- ✅ Custom HTTP/SOCKS proxies
- ✅ Any other proxy service

### Configuration

#### Step 1: Enable Proxy in config.json

```json
{
  "session": {
    "proxy": {
      "enabled": true,
      "provider": "smartproxy"
    }
  }
}
```

#### Step 2: Add Credentials to .env

```env
# Smartproxy Example
PROXY_PROVIDER=smartproxy
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=user-YOUR_USERNAME
PROXY_PASSWORD=YOUR_PASSWORD
```

### Supported Providers

#### 1. Smartproxy

**Configuration:**
```env
PROXY_PROVIDER=smartproxy
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=user-YOUR_USERNAME
PROXY_PASSWORD=YOUR_PASSWORD
```

**Notes:**
- Username format: `user-YOUR_USERNAME`
- Residential proxies recommended
- Pricing: ~£75/month for 5GB

**Website:** https://smartproxy.com

---

#### 2. Bright Data (formerly Luminati)

**Configuration:**
```env
PROXY_PROVIDER=brightdata
PROXY_HOST=brd.superproxy.io
PROXY_PORT=22225
PROXY_USERNAME=brd-customer-CUSTOMER-zone-ZONE
PROXY_PASSWORD=YOUR_PASSWORD
```

**Notes:**
- Username format: `brd-customer-CUSTOMER-zone-ZONE`
- Replace `CUSTOMER` with your customer ID
- Replace `ZONE` with your zone name
- Pricing: ~£300/month for 20GB

**Website:** https://brightdata.com

---

#### 3. Oxylabs

**Configuration:**
```env
PROXY_PROVIDER=oxylabs
PROXY_HOST=pr.oxylabs.io
PROXY_PORT=7777
PROXY_USERNAME=customer-YOUR_USERNAME
PROXY_PASSWORD=YOUR_PASSWORD
```

**Notes:**
- Username format: `customer-YOUR_USERNAME`
- Residential proxies recommended
- Pricing: ~£200/month for 10GB

**Website:** https://oxylabs.io

---

#### 4. Custom Proxy

**Configuration:**
```env
PROXY_PROVIDER=custom
PROXY_HOST=your-proxy-host.com
PROXY_PORT=8080
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password
```

**Notes:**
- Works with any HTTP/HTTPS proxy
- Works with SOCKS5 proxies
- Can be your own proxy server or any other service

---

### Proxy Features

#### Automatic Authentication

The system automatically handles proxy authentication:
```javascript
await page.authenticate({
  username: proxyConfig.username,
  password: proxyConfig.password
});
```

#### Connection Testing

On startup, the system tests the proxy connection:
```
Testing proxy connection...
✅ Proxy connection successful. IP: 203.0.113.45
```

#### IP Rotation

Most proxy services automatically rotate IPs:
- **Smartproxy**: Rotates on every request or after X minutes
- **Bright Data**: Configurable rotation (per request, per session, etc.)
- **Oxylabs**: Rotates based on session settings

#### Error Handling

If proxy fails:
- Connection test shows error
- System continues but may be blocked by DVSA
- Email notification sent if security block occurs

### Example Output with Proxy

```
🚀 PREPARING NEW SESSION
══════════════════════════════════════════════════════════════════════

📋 Session Configuration:
   Browser:     CHROME
   User Agent:  Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
   Proxy:       Enabled

════════════════════════════════════════════════════════════════
🌐 PROXY CONFIGURATION
════════════════════════════════════════════════════════════════
Provider:  Smartproxy
Host:      gate.smartproxy.com
Port:      7000
Username:  ***
Password:  ***
════════════════════════════════════════════════════════════════

🌐 Launching CHROME browser...
✅ Proxy authenticated: smartproxy
Testing proxy connection...
✅ Proxy connection successful. IP: 203.0.113.45
✅ CHROME browser initialized successfully
══════════════════════════════════════════════════════════════════════
```

## Complete Configuration Example

### config.json

```json
{
  "delays": {
    "pageLoad": { "min": 2, "max": 5 },
    "typing": { "min": 0.1, "max": 0.3 },
    "clicking": { "min": 0.5, "max": 3 },
    "navigation": { "min": 1, "max": 3 }
  },
  "monitoring": {
    "checkIntervalMinutes": 15,
    "maxRetries": 3,
    "headless": false,
    "manualInterventionTimeout": 30
  },
  "session": {
    "browserRotation": {
      "enabled": true,
      "browsers": ["chrome", "edge", "firefox"],
      "randomize": true
    },
    "proxy": {
      "enabled": true,
      "provider": "smartproxy"
    }
  }
}
```

### .env

```env
# Credentials
DVSA_LICENSE_NUMBER=YOUR_LICENSE_NUMBER
DVSA_BOOKING_REFERENCE=YOUR_BOOKING_REF

# Email
NOTIFICATION_EMAIL=your@email.com
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password

# Proxy
PROXY_PROVIDER=smartproxy
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=user-YOUR_USERNAME
PROXY_PASSWORD=YOUR_PASSWORD
```

## Best Practices

### Browser Rotation

1. **Enable for production**: Reduces detection patterns
2. **Test each browser**: Ensure Edge/Firefox installed before enabling
3. **Use all three**: Maximum randomization with Chrome, Edge, Firefox

### Proxy Usage

1. **Start without proxy**: Test your setup first
2. **Enable for production**: Reduces IP-based blocking
3. **Monitor costs**: Proxy services charge per GB of traffic
4. **Rotate providers**: Consider switching providers if blocked

### Session Strategy

**For Development:**
```json
{
  "browserRotation": { "enabled": false },
  "proxy": { "enabled": false }
}
```

**For Production:**
```json
{
  "browserRotation": { 
    "enabled": true,
    "browsers": ["chrome", "edge", "firefox"],
    "randomize": true
  },
  "proxy": { 
    "enabled": true,
    "provider": "smartproxy"
  }
}
```

## Troubleshooting

### Browser Not Found

**Error:** `Failed to launch EDGE browser`

**Solution:**
1. Install the browser (Edge or Firefox)
2. Or remove it from the `browsers` array in config.json
3. System will automatically fall back to Chrome

### Proxy Connection Failed

**Error:** `Proxy connection test failed`

**Solutions:**
1. Check credentials in .env
2. Verify proxy service is active
3. Check firewall settings
4. Try different proxy provider

### Security Block Despite Proxy

**Issue:** Still getting blocked even with proxy

**Solutions:**
1. Reduce check frequency (increase `checkIntervalMinutes`)
2. Add more delays in config.json
3. Try different proxy provider
4. Enable browser rotation
5. Contact proxy provider for residential IPs

## Cost Estimates

### Proxy Services (Monthly)

| Provider | Price | Traffic | Best For |
|----------|-------|---------|----------|
| Smartproxy | £75 | 5GB | Small scale (1-10 users) |
| Bright Data | £300 | 20GB | Medium scale (10-100 users) |
| Oxylabs | £200 | 10GB | Medium scale (10-50 users) |
| Custom VPN | £10 | Unlimited | Development/Testing |

### Recommendations

- **Development**: No proxy needed
- **Personal Use**: VPN (£10/month)
- **Small Business**: Smartproxy (£75/month)
- **Scale**: Bright Data or Oxylabs (£200-300/month)

## Summary

✅ **Browser Rotation**: Randomly rotate between Chrome, Edge, Firefox
✅ **Clean Profiles**: Always fresh, no extensions, no cache
✅ **Universal Proxy**: Works with any proxy service
✅ **Automatic Authentication**: Handles proxy credentials
✅ **Connection Testing**: Verifies proxy on startup
✅ **Fallback Support**: Auto-fallback to Chrome if other browsers fail
✅ **Easy Configuration**: Simple config.json + .env setup

**Ready to use!** Just enable in config.json and add credentials to .env.
