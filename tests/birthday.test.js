const { test } = require('@testim/testim-cli');

test('Birthday Greeting Tests', async ({ page }) => {
  // Test birthday greeting display
  await page.goto('/');
  
  // Mock today's date to be a birthday
  await page.evaluate(() => {
    const today = new Date();
    const mockDate = new Date('1950-06-15'); // Alice's birthday
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });
  
  // Verify birthday greeting appears
  await page.waitForSelector('text=Happy Birthday, Alice!');
  
  // Test birthday sound plays
  const soundPlayed = await page.evaluate(() => {
    return new Promise(resolve => {
      const audio = document.querySelector('audio');
      if (audio) {
        audio.addEventListener('play', () => resolve(true));
        setTimeout(() => resolve(false), 1000);
      } else {
        resolve(false);
      }
    });
  });
  
  if (!soundPlayed) {
    throw new Error('Birthday sound did not play');
  }
  
  // Test greeting dismissal
  await page.click('text=Close');
  await page.waitForSelector('text=Happy Birthday, Alice!', { state: 'hidden' });
  
  // Test no greeting on non-birthday
  await page.evaluate(() => {
    const today = new Date();
    const mockDate = new Date('2024-01-01'); // Not a birthday
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });
  
  await page.reload();
  const greetingVisible = await page.isVisible('text=Happy Birthday');
  if (greetingVisible) {
    throw new Error('Birthday greeting should not show on non-birthday');
  }
  
  // Test consent preference
  await page.goto('/settings/privacy');
  await page.click('text=Date of Birth Usage');
  await page.click('text=Save');
  
  // Mock birthday again
  await page.evaluate(() => {
    const today = new Date();
    const mockDate = new Date('1950-06-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });
  
  await page.goto('/');
  const greetingVisibleAfterConsent = await page.isVisible('text=Happy Birthday');
  if (!greetingVisibleAfterConsent) {
    throw new Error('Birthday greeting should show after consent');
  }
}); 