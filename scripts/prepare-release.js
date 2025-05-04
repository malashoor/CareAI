const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APP_NAME = 'CareAI';
const VERSION = process.env.VERSION || '1.0.0';
const BUILD_NUMBER = process.env.BUILD_NUMBER || '1';
const PRIVACY_POLICY_URL = 'https://careai.app/privacy-policy';
const SUPPORT_URL = 'https://careai.app/support';

// Update app.json
function updateAppConfig() {
  console.log('Updating app configuration...');
  const appJsonPath = path.join(__dirname, '../app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // Update version and build number
  appJson.expo.version = VERSION;
  appJson.expo.ios.buildNumber = BUILD_NUMBER;
  appJson.expo.android.versionCode = parseInt(BUILD_NUMBER);

  // Update privacy policy and support URLs
  appJson.expo.extra = {
    ...appJson.expo.extra,
    privacyPolicyUrl: PRIVACY_POLICY_URL,
    supportUrl: SUPPORT_URL,
  };

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('✓ App configuration updated');
}

// Generate App Store metadata
function generateAppStoreMetadata() {
  console.log('Generating App Store metadata...');
  const metadataDir = path.join(__dirname, '../metadata');
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir);
  }

  // Create metadata files
  const metadata = {
    name: APP_NAME,
    subtitle: 'AI-Powered Care Management',
    description: `CareAI helps caregivers and seniors manage medications, track health metrics, and stay connected. Features include:
• Medication scanning and reminders
• Fall detection and emergency alerts
• Health tracking and reporting
• Secure messaging and video calls
• Multi-language support (English & Arabic)`,
    keywords: [
      'caregiver',
      'senior care',
      'medication',
      'health tracking',
      'fall detection',
      'emergency',
      'family',
      'wellness',
      'monitoring',
      'assistance'
    ].join(','),
    privacyPolicyUrl: PRIVACY_POLICY_URL,
    supportUrl: SUPPORT_URL,
  };

  fs.writeFileSync(
    path.join(metadataDir, 'app-store-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log('✓ App Store metadata generated');
}

// Check build requirements
function checkBuildRequirements() {
  console.log('Checking build requirements...');
  const requirements = [
    {
      name: 'Xcode',
      command: 'xcodebuild -version',
      required: true,
    },
    {
      name: 'CocoaPods',
      command: 'pod --version',
      required: true,
    },
    {
      name: 'Fastlane',
      command: 'fastlane --version',
      required: true,
    },
  ];

  let allRequirementsMet = true;
  requirements.forEach(req => {
    try {
      execSync(req.command);
      console.log(`✓ ${req.name} is installed`);
    } catch (error) {
      console.error(`✗ ${req.name} is not installed`);
      if (req.required) {
        allRequirementsMet = false;
      }
    }
  });

  return allRequirementsMet;
}

// Main execution
async function main() {
  try {
    console.log('Preparing release...');
    
    // Update app configuration
    updateAppConfig();
    
    // Generate App Store metadata
    generateAppStoreMetadata();
    
    // Check build requirements
    const requirementsMet = checkBuildRequirements();
    if (!requirementsMet) {
      console.error('Some required tools are missing. Please install them before proceeding.');
      process.exit(1);
    }

    console.log('\nRelease preparation completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run build:ios" to create the iOS archive');
    console.log('2. Upload to App Store Connect using Xcode or Fastlane');
    console.log('3. Configure TestFlight groups and invite testers');
    console.log('4. Submit for App Store review');
  } catch (error) {
    console.error('Error preparing release:', error);
    process.exit(1);
  }
}

main(); 