import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run commands and handle errors
const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    return false;
  }
};

// Main build process
const buildRelease = async () => {
  console.log('Starting CareAI release build process...');

  // 1. Clean and install dependencies
  console.log('\n1. Installing dependencies...');
  if (!runCommand('cd .. && npm install')) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }

  // 2. Generate screenshots
  console.log('\n2. Generating screenshots...');
  if (!runCommand('npm run generate-screenshots')) {
    console.error('Failed to generate screenshots');
    process.exit(1);
  }

  // 3. Build Android app bundle
  console.log('\n3. Building Android app bundle...');
  if (!runCommand('cd .. && eas build --platform android --profile production')) {
    console.error('Failed to build Android app bundle');
    process.exit(1);
  }

  console.log('\nBuild process completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Test the generated .aab file on real devices');
  console.log('2. Upload the .aab file to Google Play Console');
  console.log('3. Complete the store listing in Google Play Console');
  console.log('4. Submit for review');
};

buildRelease().catch(console.error); 