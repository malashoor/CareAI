const { test } = require('@testim/testim-cli');

test('Social Activities Flow', async ({ page }) => {
  // Navigate to social activities
  await page.click('text=Social');
  await page.waitForSelector('text=Social Activities');
  
  // Create new activity
  await page.click('text=Create Activity');
  await page.waitForSelector('text=New Activity');
  await page.fill('input[name="title"]', 'Morning Yoga');
  await page.fill('textarea[name="description"]', 'Gentle yoga session');
  await page.click('text=Create');
  
  // Join activity
  await page.click('text=Morning Yoga');
  await page.waitForSelector('text=Activity Details');
  await page.click('text=Join Activity');
  
  // Verify participation
  await page.waitForSelector('text=You have joined this activity');
});