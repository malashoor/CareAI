const { test } = require('@testim/testim-cli');

test('UI Feedback Integration Tests', async ({ page }) => {
  // Test UI metrics adaptation
  await page.goto('/settings');
  
  // Record feedback about button size
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('uiFeedback', {
      detail: {
        type: 'button',
        screen: 'settings',
        feedback: 'buttons too small'
      }
    }));
  });
  
  // Verify UI metrics updated
  const updatedMetrics = await page.evaluate(() => {
    return localStorage.getItem('uiMetrics');
  });
  
  const metrics = JSON.parse(updatedMetrics);
  if (metrics.buttonSize <= 48) {
    throw new Error('UI metrics not adapting to feedback');
  }

  // Test accessibility improvements
  const contrast = await page.evaluate(() => {
    const element = document.querySelector('h1');
    const style = window.getComputedStyle(element);
    return style.color;
  });
  
  // Verify high contrast
  if (!contrast.includes('rgb(0, 0, 0)')) {
    throw new Error('Insufficient text contrast for accessibility');
  }

  // Test responsive layout
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  
  // Verify layout adaptation
  const isResponsive = await page.evaluate(() => {
    const element = document.querySelector('.container');
    const style = window.getComputedStyle(element);
    return style.maxWidth === '100%';
  });
  
  if (!isResponsive) {
    throw new Error('Layout not responding to screen size');
  }
});