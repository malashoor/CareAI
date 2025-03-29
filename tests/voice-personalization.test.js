const { test } = require('@testim/testim-cli');

test('Voice Personalization Tests', async ({ page }) => {
  // Test voice settings for different age groups
  const testCases = [
    { age: 65, expectedSpeed: 1.0, expectedVolume: 1.0 },
    { age: 75, expectedSpeed: 0.9, expectedVolume: 1.2 },
  ];

  for (const testCase of testCases) {
    await page.goto('/onboarding/voice');
    
    // Mock date of birth based on age
    const birthYear = new Date().getFullYear() - testCase.age;
    const mockDate = new Date(birthYear, 0, 1);
    
    await page.evaluate((date) => {
      jest.spyOn(global, 'Date').mockImplementation(() => date);
    }, mockDate);
    
    // Verify initial settings
    const speedValue = await page.evaluate(() => {
      const speedText = document.querySelector('.value').textContent;
      return parseFloat(speedText) / 100;
    });
    
    if (Math.abs(speedValue - testCase.expectedSpeed) > 0.1) {
      throw new Error(`Incorrect initial speed for age ${testCase.age}`);
    }
    
    // Test adjusting settings
    await page.click('text=+');
    const adjustedSpeed = await page.evaluate(() => {
      const speedText = document.querySelector('.value').textContent;
      return parseFloat(speedText) / 100;
    });
    
    if (adjustedSpeed <= speedValue) {
      throw new Error('Speed adjustment not working');
    }
    
    // Test sample playback
    await page.click('text=Play Sample');
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
      throw new Error('Sample playback not working');
    }
    
    // Test saving settings
    await page.click('text=Save Settings');
    
    // Verify settings are saved
    const savedSettings = await page.evaluate(() => {
      return localStorage.getItem('@careai_voice_settings');
    });
    
    if (!savedSettings) {
      throw new Error('Settings not saved to local storage');
    }
    
    const settings = JSON.parse(savedSettings);
    if (Math.abs(settings.speed - adjustedSpeed) > 0.1) {
      throw new Error('Settings not saved correctly');
    }
  }
  
  // Test persistence after reload
  await page.reload();
  const persistedSettings = await page.evaluate(() => {
    return localStorage.getItem('@careai_voice_settings');
  });
  
  if (!persistedSettings) {
    throw new Error('Settings not persisted after reload');
  }
}); 