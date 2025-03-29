const { test } = require('@testim/testim-cli');

test('Fall Detection Monitoring', async ({ page }) => {
  // Navigate to monitoring
  await page.click('text=Safety');
  await page.waitForSelector('text=Fall Detection');
  
  // Test monitoring activation
  await page.click('text=Start Monitoring');
  await page.waitForSelector('text=Monitoring Active');
  
  // Test alert system
  await page.evaluate(() => {
    // Simulate fall detection event
    window.dispatchEvent(new CustomEvent('fallDetected', {
      detail: {
        severity: 'high',
        location: { latitude: 40.7128, longitude: -74.0060 }
      }
    }));
  });
  
  // Verify alert
  await page.waitForSelector('text=Fall Detected');
  await page.waitForSelector('text=HIGH');
});