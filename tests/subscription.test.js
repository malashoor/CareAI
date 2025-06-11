const { test } = require('@testim/testim-cli');

test('Subscription System', async ({ page }) => {
  // Test subscription flow
  await page.goto('/subscription');
  
  // Test free trial
  await page.click('text=Start Free Trial');
  await page.waitForSelector('text=Trial Active');
  
  // Test upgrade to premium
  await page.click('text=Upgrade to Premium');
  await page.fill('input[name="card_number"]', '4242424242424242');
  await page.fill('input[name="expiry"]', '12/25');
  await page.fill('input[name="cvc"]', '123');
  await page.click('text=Subscribe');
  
  // Verify subscription status
  await page.waitForSelector('text=Premium Plan Active');
  
  // Test downgrade
  await page.click('text=Change Plan');
  await page.click('text=Downgrade to Basic');
  await page.click('text=Confirm Downgrade');
  
  // Verify downgrade scheduled
  await page.waitForSelector('text=Plan changes at end of billing period');
});