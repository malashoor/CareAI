const { test } = require('@testim/testim-cli');

test('Offline Functionality', async ({ page }) => {
  // Test offline data persistence
  await page.goto('/health');
  
  // Simulate offline mode
  await page.setOfflineMode(true);
  
  // Add health metric while offline
  await page.click('text=Add Measurement');
  await page.fill('input[name="value"]', '120/80');
  await page.click('text=Save');
  
  // Verify data is saved locally
  const healthData = await page.evaluate(() => {
    return localStorage.getItem('health_metrics');
  });
  
  if (!healthData) {
    throw new Error('Health data not saved offline');
  }
  
  // Restore online mode
  await page.setOfflineMode(false);
  
  // Wait for sync
  await page.waitForSelector('text=Syncing complete');
  
  // Verify data synced to server
  const syncStatus = await page.evaluate(() => {
    return localStorage.getItem('sync_queue');
  });
  
  if (syncStatus !== '[]') {
    throw new Error('Data not synced to server');
  }
});