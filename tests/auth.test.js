const { test } = require('@testim/testim-cli');

test('User Authentication Flow', async ({ page }) => {
  // Test welcome screen
  await page.goto('/');
  await page.waitForSelector('text=Welcome to CareAI');
  
  // Test role selection
  await page.click('text=Get Started');
  await page.waitForSelector('text=Choose Your Role');
  await page.click('text=Senior');
  
  // Test authentication
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('text=Sign In');
  
  // Verify successful login
  await page.waitForSelector('text=Home');
});