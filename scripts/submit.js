const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUNDLE_PATH = path.join(__dirname, '../android/app/build/outputs/bundle/release/app-release.aab');
const PLAY_STORE_CREDENTIALS = process.env.PLAY_STORE_CREDENTIALS || 'path/to/your/play-store-credentials.json';

function checkPrerequisites() {
  // Check if bundle exists
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error('Release bundle not found. Please build the app first.');
    process.exit(1);
  }

  // Check if Play Store credentials exist
  if (!fs.existsSync(PLAY_STORE_CREDENTIALS)) {
    console.error('Play Store credentials not found. Please set up your credentials.');
    process.exit(1);
  }
}

function buildRelease() {
  try {
    console.log('Building release bundle...');
    execSync('cd android && ./gradlew bundleRelease', { stdio: 'inherit' });
    console.log('Release bundle built successfully!');
  } catch (error) {
    console.error('Error building release bundle:', error);
    process.exit(1);
  }
}

function submitToPlayStore() {
  try {
    console.log('Submitting to Play Store...');
    const command = `fastlane supply --aab ${BUNDLE_PATH} --json_key ${PLAY_STORE_CREDENTIALS}`;
    execSync(command, { stdio: 'inherit' });
    console.log('App submitted to Play Store successfully!');
  } catch (error) {
    console.error('Error submitting to Play Store:', error);
    process.exit(1);
  }
}

// Run the submission process
console.log('Starting Play Store submission process...');
checkPrerequisites();
buildRelease();
submitToPlayStore(); 