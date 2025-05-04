describe('Screenshot Flows', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { 
        'FASTLANE_SNAPSHOT': 'true',
        'screenshot-flow': 'onboarding'
      }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete onboarding flow', async () => {
    // Wait for onboarding screen
    await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(2000);
    
    // Complete onboarding steps
    await element(by.id('onboarding-next')).tap();
    await element(by.id('onboarding-next')).tap();
    await element(by.id('onboarding-complete')).tap();
    
    // Verify dashboard is visible
    await waitFor(element(by.id('dashboard-screen'))).toBeVisible().withTimeout(2000);
  });

  it('should demonstrate chat flow', async () => {
    // Navigate to chat
    await element(by.id('nav-chat')).tap();
    
    // Wait for chat screen
    await waitFor(element(by.id('chat-screen'))).toBeVisible().withTimeout(2000);
    
    // Send a message
    await element(by.id('chat-input')).typeText('Hello, I need help');
    await element(by.id('send-button')).tap();
    
    // Wait for response
    await waitFor(element(by.id('chat-response'))).toBeVisible().withTimeout(2000);
  });

  it('should set up medication reminder', async () => {
    // Navigate to reminders
    await element(by.id('nav-reminders')).tap();
    
    // Add new reminder
    await element(by.id('add-reminder')).tap();
    
    // Fill reminder details
    await element(by.id('reminder-name')).typeText('Take medication');
    await element(by.id('reminder-time')).tap();
    await element(by.id('time-picker')).setDatePickerDate('2024-03-20 08:00:00');
    await element(by.id('save-reminder')).tap();
    
    // Verify reminder is added
    await waitFor(element(by.text('Take medication'))).toBeVisible().withTimeout(2000);
  });

  it('should demonstrate SOS flow', async () => {
    // Navigate to SOS
    await element(by.id('nav-sos')).tap();
    
    // Wait for SOS screen
    await waitFor(element(by.id('sos-screen'))).toBeVisible().withTimeout(2000);
    
    // Activate SOS
    await element(by.id('sos-button')).tap();
    
    // Verify SOS activation
    await waitFor(element(by.id('sos-active'))).toBeVisible().withTimeout(2000);
  });

  it('should show admin dashboard', async () => {
    // Navigate to admin
    await element(by.id('nav-admin')).tap();
    
    // Wait for admin screen
    await waitFor(element(by.id('admin-screen'))).toBeVisible().withTimeout(2000);
    
    // Verify admin features
    await waitFor(element(by.id('admin-stats'))).toBeVisible().withTimeout(2000);
  });

  it('should demonstrate settings accessibility', async () => {
    // Navigate to settings
    await element(by.id('nav-settings')).tap();
    
    // Wait for settings screen
    await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(2000);
    
    // Toggle accessibility features
    await element(by.id('accessibility-toggle')).tap();
    
    // Verify accessibility settings
    await waitFor(element(by.id('accessibility-enabled'))).toBeVisible().withTimeout(2000);
  });

  it('should show emotion tracking', async () => {
    // Navigate to emotion tracking
    await element(by.id('nav-emotion')).tap();
    
    // Wait for emotion screen
    await waitFor(element(by.id('emotion-screen'))).toBeVisible().withTimeout(2000);
    
    // Select emotion
    await element(by.id('emotion-select')).tap();
    await element(by.text('Happy')).tap();
    
    // Verify emotion selection
    await waitFor(element(by.id('emotion-selected'))).toBeVisible().withTimeout(2000);
  });

  it('should demonstrate admin export', async () => {
    // Navigate to admin
    await element(by.id('nav-admin')).tap();
    
    // Wait for admin screen
    await waitFor(element(by.id('admin-screen'))).toBeVisible().withTimeout(2000);
    
    // Export to PDF
    await element(by.id('export-pdf')).tap();
    
    // Verify export
    await waitFor(element(by.id('export-success'))).toBeVisible().withTimeout(2000);
  });

  it('should show churn alert', async () => {
    // Navigate to admin
    await element(by.id('nav-admin')).tap();
    
    // Wait for admin screen
    await waitFor(element(by.id('admin-screen'))).toBeVisible().withTimeout(2000);
    
    // Trigger churn alert
    await element(by.id('trigger-churn')).tap();
    
    // Verify churn alert
    await waitFor(element(by.id('churn-alert'))).toBeVisible().withTimeout(2000);
  });
}); 