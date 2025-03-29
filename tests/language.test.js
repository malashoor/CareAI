const { test } = require('@testim/testim-cli');

test('Language Support and RTL Layout', async ({ page }) => {
  // Test language switching
  await page.goto('/settings');
  await page.waitForSelector('text=Language');
  await page.click('text=Language');
  
  // Test Arabic (RTL) layout
  await page.click('text=العربية');
  await page.waitForSelector('[dir="rtl"]');
  
  // Verify RTL text alignment
  const isRTL = await page.evaluate(() => {
    const element = document.querySelector('[dir="rtl"]');
    return window.getComputedStyle(element).direction === 'rtl';
  });
  
  if (!isRTL) {
    throw new Error('RTL layout not applied correctly');
  }
  
  // Test navigation in RTL mode
  await page.click('text=الرئيسية');
  await page.waitForSelector('text=مرحباً بك');
  
  // Switch back to English
  await page.click('text=الإعدادات');
  await page.click('text=اللغة');
  await page.click('text=English');
  await page.waitForSelector('[dir="ltr"]');
});