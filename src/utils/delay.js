/**
 * Utility functions for human-like delays
 */

export function getRandomDelay(min, max) {
  return (Math.random() * (max - min) + min) * 1000;
}

export async function randomDelay(min, max) {
  const delay = getRandomDelay(min, max);
  await new Promise(resolve => setTimeout(resolve, delay));
}

export async function typeWithDelay(page, selector, text, config) {
  await page.waitForSelector(selector);
  await page.click(selector);
  
  for (const char of text) {
    await page.keyboard.type(char);
    await randomDelay(config.delays.typing.min, config.delays.typing.max);
  }
}

export async function clickWithDelay(page, selector, config) {
  await page.waitForSelector(selector);
  await randomDelay(config.delays.clicking.min, config.delays.clicking.max);
  await page.click(selector);
}
