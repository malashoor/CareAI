import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEVICES = [
  { name: 'pixel-4', width: 1080, height: 2280 },
  { name: 'pixel-6', width: 1080, height: 2400 },
  { name: 'pixel-tablet', width: 2560, height: 1600 }
];

const SCREENSHOTS_DIR = path.join(__dirname, '../assets/screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Generate screenshots for each device
DEVICES.forEach(device => {
  console.log(`Generating screenshots for ${device.name}...`);
  
  try {
    // First, build the app for the specific device
    execSync(`npx expo-cli build:android --device ${device.name}`, {
      stdio: 'inherit'
    });
    
    // Then take screenshots using adb
    execSync(`adb shell screencap -p /sdcard/screenshot.png`, {
      stdio: 'inherit'
    });
    
    execSync(`adb pull /sdcard/screenshot.png ${SCREENSHOTS_DIR}/${device.name}.png`, {
      stdio: 'inherit'
    });
    
    execSync(`adb shell rm /sdcard/screenshot.png`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Error generating screenshots for ${device.name}:`, error);
  }
});

console.log('Screenshot generation complete!'); 