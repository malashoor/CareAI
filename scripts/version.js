#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = path.join(process.cwd(), 'package.json');
const APP_JSON = path.join(process.cwd(), 'app.json');

function bumpVersion(type = 'patch') {
  // Read package.json
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const [major, minor, patch] = pkg.version.split('.').map(Number);

  // Calculate new version
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');

  // Update app.json
  const app = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
  app.expo.version = newVersion;
  app.expo.ios.buildNumber = String(parseInt(app.expo.ios.buildNumber || '0') + 1);
  app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
  fs.writeFileSync(APP_JSON, JSON.stringify(app, null, 2) + '\n');

  // Git commit
  try {
    execSync('git add package.json app.json');
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`✅ Successfully bumped version to ${newVersion}`);
  } catch (error) {
    console.error('❌ Failed to commit version bump:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const type = process.argv[2];
if (type && !['major', 'minor', 'patch'].includes(type)) {
  console.error('❌ Invalid version type. Use: major, minor, or patch');
  process.exit(1);
}

bumpVersion(type); 