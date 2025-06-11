const fs = require('fs');
const path = require('path');

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${description}`);
  return exists;
}

function checkEnvironmentVariables() {
  console.log('\nEnvironment Variables:');
  const requiredVars = [
    'KEYSTORE_PASSWORD',
    'KEY_ALIAS',
    'KEY_PASSWORD',
    'PLAY_STORE_CREDENTIALS'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    const present = !!process.env[varName];
    console.log(`${present ? '✓' : '✗'} ${varName}`);
    if (!present) allPresent = false;
  });
  
  return allPresent;
}

function checkRequiredFiles() {
  console.log('\nRequired Files:');
  const files = [
    {
      path: path.join(__dirname, '../android/app/keystore.jks'),
      description: 'Keystore file'
    },
    {
      path: path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk'),
      description: 'Release APK'
    },
    {
      path: path.join(__dirname, '../android/app/build/outputs/bundle/release/app-release.aab'),
      description: 'Release Bundle'
    },
    {
      path: process.env.PLAY_STORE_CREDENTIALS || '',
      description: 'Play Store credentials'
    }
  ];
  
  let allPresent = true;
  files.forEach(file => {
    if (!checkFileExists(file.path, file.description)) {
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkAppConfiguration() {
  console.log('\nApp Configuration:');
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../app.json'), 'utf8'));
  const expo = appJson.expo;
  
  const checks = [
    {
      condition: expo.android.versionCode > 0,
      description: 'Version code is set'
    },
    {
      condition: !!expo.android.package,
      description: 'Package name is set'
    },
    {
      condition: !!expo.extra?.privacyPolicyUrl,
      description: 'Privacy policy URL is set'
    },
    {
      condition: expo.android.permissions.length > 0,
      description: 'Required permissions are set'
    },
    {
      condition: !!expo.android.adaptiveIcon,
      description: 'Adaptive icon is configured'
    }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    console.log(`${check.condition ? '✓' : '✗'} ${check.description}`);
    if (!check.condition) allPassed = false;
  });
  
  return allPassed;
}

// Run the checklist
console.log('Starting Play Store submission checklist...\n');

const envCheck = checkEnvironmentVariables();
const filesCheck = checkRequiredFiles();
const configCheck = checkAppConfiguration();

console.log('\nSummary:');
console.log(`Environment Variables: ${envCheck ? '✓' : '✗'}`);
console.log(`Required Files: ${filesCheck ? '✓' : '✗'}`);
console.log(`App Configuration: ${configCheck ? '✓' : '✗'}`);

if (envCheck && filesCheck && configCheck) {
  console.log('\n✓ All checks passed! You are ready to submit to the Play Store.');
  console.log('\nNext steps:');
  console.log('1. Run test-release.js to verify the build');
  console.log('2. Test the release APK on your device');
  console.log('3. Run submit.js to upload to Play Store');
} else {
  console.log('\n✗ Some checks failed. Please address the issues marked with ✗ before proceeding.');
  process.exit(1);
} 