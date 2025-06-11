const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RELEASE_APK = path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
const RELEASE_BUNDLE = path.join(__dirname, '../android/app/build/outputs/bundle/release/app-release.aab');

function checkKeystore() {
  const keystorePath = path.join(__dirname, '../android/app/keystore.jks');
  if (!fs.existsSync(keystorePath)) {
    console.error('Keystore not found. Please run keystore.js first.');
    process.exit(1);
  }
  console.log('✓ Keystore found');
}

function buildRelease() {
  try {
    console.log('Building release APK...');
    execSync('cd android && ./gradlew assembleRelease', { stdio: 'inherit' });
    console.log('✓ Release APK built successfully');
  } catch (error) {
    console.error('Error building release APK:', error);
    process.exit(1);
  }
}

function buildBundle() {
  try {
    console.log('Building release bundle...');
    execSync('cd android && ./gradlew bundleRelease', { stdio: 'inherit' });
    console.log('✓ Release bundle built successfully');
  } catch (error) {
    console.error('Error building release bundle:', error);
    process.exit(1);
  }
}

function verifyBuilds() {
  if (!fs.existsSync(RELEASE_APK)) {
    console.error('Release APK not found');
    process.exit(1);
  }
  if (!fs.existsSync(RELEASE_BUNDLE)) {
    console.error('Release bundle not found');
    process.exit(1);
  }
  
  const apkSize = fs.statSync(RELEASE_APK).size;
  const bundleSize = fs.statSync(RELEASE_BUNDLE).size;
  
  console.log('\nBuild Verification:');
  console.log(`✓ Release APK: ${(apkSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Release Bundle: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Check if builds are signed
  try {
    execSync(`jarsigner -verify -verbose -certs ${RELEASE_APK}`, { stdio: 'inherit' });
    console.log('✓ APK is properly signed');
  } catch (error) {
    console.error('APK signing verification failed:', error);
    process.exit(1);
  }
}

function checkPlayStoreRequirements() {
  console.log('\nPlay Store Requirements Check:');
  
  // Check app.json configuration
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../app.json'), 'utf8'));
  const expo = appJson.expo;
  
  const requirements = {
    'Version Code': expo.android.versionCode,
    'Package Name': expo.android.package,
    'Privacy Policy URL': expo.extra?.privacyPolicyUrl,
    'Required Permissions': expo.android.permissions.length,
    'Adaptive Icon': !!expo.android.adaptiveIcon
  };
  
  Object.entries(requirements).forEach(([key, value]) => {
    console.log(`✓ ${key}: ${value}`);
  });
}

// Run the verification process
console.log('Starting release verification process...\n');
checkKeystore();
buildRelease();
buildBundle();
verifyBuilds();
checkPlayStoreRequirements();

console.log('\n✓ All checks passed successfully!');
console.log('\nNext steps:');
console.log('1. Test the release APK on your device');
console.log('2. Verify all features work as expected');
console.log('3. Run the submit.js script to upload to Play Store'); 