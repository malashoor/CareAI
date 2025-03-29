const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const KEYSTORE_PATH = path.join(__dirname, '../android/app/keystore.jks');
const KEYSTORE_PASSWORD = process.env.KEYSTORE_PASSWORD || 'your_keystore_password';
const KEY_ALIAS = process.env.KEY_ALIAS || 'careai_key';
const KEY_PASSWORD = process.env.KEY_PASSWORD || 'your_key_password';

function generateKeystore() {
  try {
    // Check if keystore already exists
    if (fs.existsSync(KEYSTORE_PATH)) {
      console.log('Keystore already exists. Skipping generation.');
      return;
    }

    // Create keystore directory if it doesn't exist
    const keystoreDir = path.dirname(KEYSTORE_PATH);
    if (!fs.existsSync(keystoreDir)) {
      fs.mkdirSync(keystoreDir, { recursive: true });
    }

    // Generate keystore
    const command = `keytool -genkey -v -keystore ${KEYSTORE_PATH} -alias ${KEY_ALIAS} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${KEYSTORE_PASSWORD} -keypass ${KEY_PASSWORD}`;
    
    execSync(command, { stdio: 'inherit' });
    console.log('Keystore generated successfully!');
    
    // Add keystore to .gitignore if not already present
    const gitignorePath = path.join(__dirname, '../.gitignore');
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('keystore.jks')) {
      gitignoreContent += '\n# Android Keystore\nandroid/app/keystore.jks\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('Added keystore to .gitignore');
    }
  } catch (error) {
    console.error('Error generating keystore:', error);
    process.exit(1);
  }
}

function updateGradleConfig() {
  try {
    const gradlePath = path.join(__dirname, '../android/app/build.gradle');
    let gradleContent = fs.readFileSync(gradlePath, 'utf8');

    // Add signing config if not present
    if (!gradleContent.includes('signingConfigs')) {
      const signingConfig = `
    signingConfigs {
        release {
            storeFile file('keystore.jks')
            storePassword "${KEYSTORE_PASSWORD}"
            keyAlias "${KEY_ALIAS}"
            keyPassword "${KEY_PASSWORD}"
        }
    }`;

      // Insert signing config before buildTypes
      gradleContent = gradleContent.replace(
        /buildTypes\s*{/,
        `${signingConfig}\n    buildTypes {`
      );

      // Update release build type to use signing config
      gradleContent = gradleContent.replace(
        /release\s*{/,
        'release {\n            signingConfig signingConfigs.release'
      );

      fs.writeFileSync(gradlePath, gradleContent);
      console.log('Updated build.gradle with signing configuration');
    }
  } catch (error) {
    console.error('Error updating Gradle config:', error);
    process.exit(1);
  }
}

// Run the setup
generateKeystore();
updateGradleConfig(); 