import dotenv from 'dotenv';

dotenv.config();

/**
 * Proxy adapter for various proxy service providers
 * Supports: Smartproxy, Bright Data, Oxylabs, custom HTTP/SOCKS proxies
 */

/**
 * Get proxy configuration from environment variables or config
 * @param {Object} config - Configuration object
 * @returns {Object|null} Proxy configuration or null if disabled
 */
export function getProxyConfig(config) {
  // Check if proxy is enabled
  const proxyEnabled = config.session?.proxy?.enabled || false;
  
  if (!proxyEnabled) {
    console.log('ℹ️  Proxy disabled in config');
    return null;
  }
  
  // Get proxy settings from environment variables (priority) or config
  const provider = process.env.PROXY_PROVIDER || config.session?.proxy?.provider || 'none';
  
  if (provider === 'none') {
    console.log('ℹ️  No proxy provider configured');
    return null;
  }
  
  // Get credentials from environment variables
  const host = process.env.PROXY_HOST || config.session?.proxy?.host;
  const port = process.env.PROXY_PORT || config.session?.proxy?.port;
  const username = process.env.PROXY_USERNAME || config.session?.proxy?.username;
  const password = process.env.PROXY_PASSWORD || config.session?.proxy?.password;
  
  if (!host || !port) {
    console.log('⚠️  Proxy enabled but host/port not configured');
    return null;
  }
  
  return {
    provider,
    host,
    port,
    username,
    password
  };
}

/**
 * Format proxy URL for Puppeteer
 * @param {Object} proxyConfig - Proxy configuration
 * @returns {string} Formatted proxy URL
 */
export function formatProxyUrl(proxyConfig) {
  const { host, port, username, password } = proxyConfig;
  
  // Format: http://username:password@host:port or http://host:port
  if (username && password) {
    return `http://${username}:${password}@${host}:${port}`;
  }
  
  return `http://${host}:${port}`;
}

/**
 * Get Puppeteer proxy arguments
 * @param {Object} proxyConfig - Proxy configuration
 * @returns {Array} Array of Puppeteer launch arguments
 */
export function getProxyArgs(proxyConfig) {
  if (!proxyConfig) {
    return [];
  }
  
  const { host, port } = proxyConfig;
  
  return [
    `--proxy-server=http://${host}:${port}`
  ];
}

/**
 * Authenticate proxy if credentials are provided
 * @param {Page} page - Puppeteer page object
 * @param {Object} proxyConfig - Proxy configuration
 */
export async function authenticateProxy(page, proxyConfig) {
  if (!proxyConfig || !proxyConfig.username || !proxyConfig.password) {
    return;
  }
  
  await page.authenticate({
    username: proxyConfig.username,
    password: proxyConfig.password
  });
  
  console.log(`✅ Proxy authenticated: ${proxyConfig.provider}`);
}

/**
 * Test proxy connection
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} Object with success flag and IP information
 */
export async function testProxyConnection(page) {
  try {
    console.log('Testing proxy connection...');
    
    // Navigate to IP check service
    await page.goto('https://api.ipify.org?format=json', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // Extract IP address
    const ipInfo = await page.evaluate(() => {
      try {
        const bodyText = document.body.textContent;
        const data = JSON.parse(bodyText);
        return { ip: data.ip };
      } catch (e) {
        return { ip: 'Unknown' };
      }
    });
    
    console.log(`✅ Proxy connection successful. IP: ${ipInfo.ip}`);
    return { success: true, ...ipInfo };
    
  } catch (error) {
    console.error('❌ Proxy connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Provider-specific configurations and helpers
 */
export const ProxyProviders = {
  /**
   * Smartproxy configuration
   * Format: gate.smartproxy.com:7000
   * Username: user-USERNAME
   * Password: PASSWORD
   */
  smartproxy: {
    name: 'Smartproxy',
    defaultHost: 'gate.smartproxy.com',
    defaultPort: '7000',
    docs: 'https://smartproxy.com/proxies/residential-proxies',
    notes: 'Use format: user-USERNAME for username'
  },
  
  /**
   * Bright Data (formerly Luminati) configuration
   * Format: brd.superproxy.io:22225
   * Username: brd-customer-CUSTOMER-zone-ZONE
   * Password: PASSWORD
   */
  brightdata: {
    name: 'Bright Data',
    defaultHost: 'brd.superproxy.io',
    defaultPort: '22225',
    docs: 'https://brightdata.com/products/residential-proxies',
    notes: 'Use format: brd-customer-CUSTOMER-zone-ZONE for username'
  },
  
  /**
   * Oxylabs configuration
   * Format: pr.oxylabs.io:7777
   * Username: customer-USERNAME
   * Password: PASSWORD
   */
  oxylabs: {
    name: 'Oxylabs',
    defaultHost: 'pr.oxylabs.io',
    defaultPort: '7777',
    docs: 'https://oxylabs.io/products/residential-proxy-pool',
    notes: 'Use format: customer-USERNAME for username'
  },
  
  /**
   * Custom HTTP/SOCKS proxy
   */
  custom: {
    name: 'Custom Proxy',
    docs: 'Configure your own proxy server',
    notes: 'Supports HTTP and SOCKS5 proxies'
  }
};

/**
 * Get provider information
 * @param {string} provider - Provider name
 * @returns {Object} Provider information
 */
export function getProviderInfo(provider) {
  return ProxyProviders[provider.toLowerCase()] || ProxyProviders.custom;
}

/**
 * Log proxy configuration (without sensitive data)
 * @param {Object} proxyConfig - Proxy configuration
 */
export function logProxyConfig(proxyConfig) {
  if (!proxyConfig) {
    console.log('ℹ️  No proxy configured');
    return;
  }
  
  const providerInfo = getProviderInfo(proxyConfig.provider);
  
  console.log('\n' + '='.repeat(60));
  console.log('🌐 PROXY CONFIGURATION');
  console.log('='.repeat(60));
  console.log(`Provider:  ${providerInfo.name}`);
  console.log(`Host:      ${proxyConfig.host}`);
  console.log(`Port:      ${proxyConfig.port}`);
  console.log(`Username:  ${proxyConfig.username ? '***' : 'Not set'}`);
  console.log(`Password:  ${proxyConfig.password ? '***' : 'Not set'}`);
  console.log('='.repeat(60) + '\n');
}
