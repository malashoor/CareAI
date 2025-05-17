# Pipeline Troubleshooting Guide

This document provides solutions for common issues that may occur during the CareAI CI/CD pipeline process.

## Common EAS Build Issues

### Certificate Expired

**Symptoms:**
- Build fails with "Your Apple Distribution Certificate has expired"
- Error in logs about "Unable to validate your application"

**Solutions:**
```bash
# Regenerate certificates
eas credentials --platform ios

# Or reset completely (if Apple account has reached certificate limit)
eas credentials clear --platform ios
eas build:configure --platform ios
```

### Watchman Issues

**Symptoms:**
- Metro bundler fails to start
- "watchman crawl failed" messages
- Build hangs during JavaScript bundling

**Solutions:**
```bash
# Quick fix
watchman watch-del-all
rm -rf $TMPDIR/metro-*

# Complete reset (if above doesn't work)
./scripts/reset-metro.sh
```

### Missing Environment Variables

**Symptoms:**
- Build fails with "Missing SUPABASE_URL"
- Secrets not available during build

**Solutions:**
1. Check if secrets are properly set in GitHub:
   - Go to repository Settings → Secrets → Actions
   - Verify all required secrets are set

2. Make sure EAS secrets are synced:
```bash
eas secret:list
# If missing, add them:
eas secret:create SUPABASE_URL --scope project --value "your_value"
```

## Supabase Deployment Issues

### Migration Failures

**Symptoms:**
- Error "permission denied for schema public"
- Error "relation already exists"

**Solutions:**
```bash
# Make sure SERVICE_ROLE_KEY has proper permissions
supabase db reset --linked

# For specific permission errors:
supabase db push --db-role postgres
```

### Functions Deployment Failure

**Symptoms:**
- Edge function deployment fails
- "Error: Failed to build Edge Function"

**Solutions:**
```bash
# Check for TypeScript errors
cd supabase/functions/send-reminder
npm run lint

# Try deploying individual function
supabase functions deploy send-reminder --project-ref wvuyppurctdosfvlefkk
```

## iOS Specific Issues

### Bridgeless Mode Errors

**Symptoms:**
- Build fails with "RCTBridgeDidNotInitializeNotification"
- Warning about "Bridgeless mode may not be properly disabled"

**Solutions:**
```bash
# Fix bridgeless mode issue
./scripts/rebuild-ios.sh

# If still failing, verify .xcode.env.local settings:
echo "export RCT_NEW_ARCH_ENABLED=0" > .xcode.env.local
```

### Format String Warnings

**Symptoms:**
- Warnings about "NSString format specifiers in a string literal"
- Deprecation notices related to fmt macros

**Solutions:**
```bash
# Fix format warnings (should already be handled by rebuild-ios.sh)
./scripts/fix-fmt.sh

# Verify fix was applied
grep -r "fmt/core.h" ios/
```

### Cocoapods Issues

**Symptoms:**
- "Unable to find a specification for..."
- Pod install fails with missing dependencies

**Solutions:**
```bash
cd ios
pod deintegrate
pod setup
pod install --repo-update

# If still failing:
rm -rf ~/Library/Caches/CocoaPods
pod install --clean
```

## Android Specific Issues

### Gradle Build Failures

**Symptoms:**
- "Could not find com.android.tools.build:gradle:X.Y.Z"
- Java compiler errors
- "Failed to transform" artifacts

**Solutions:**
```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies

# If that doesn't work, try updating the gradle wrapper:
./gradlew wrapper --gradle-version 7.5.1
```

### SDK License Agreements

**Symptoms:**
- "You have not accepted the license agreements"
- SDK license not accepted

**Solutions:**
```bash
# Accept all licenses
yes | sdkmanager --licenses
```

## Test & Validation Issues

### Jest Test Failures

**Symptoms:**
- "Cannot find module" in test logs
- Timeout errors in component tests

**Solutions:**
```bash
# Clear Jest cache
jest --clearCache

# Run specific tests with debug output
jest --runInBand --verbose NotificationCenter
```

### E2E Test Failures

**Symptoms:**
- Detox tests fail with element not found
- Timeout waiting for element 

**Solutions:**
```bash
# Rebuild test app
detox build --configuration ios.sim.debug

# Run with debug logs
detox test --configuration ios.sim.debug --loglevel trace
```

## Notification Testing Issues

### Push Notifications Not Delivered

**Symptoms:**
- Notifications sent from test script don't appear
- "No valid 'aps' payload" errors

**Solutions:**
```bash
# Check device token registration
./scripts/check-notification-status.sh

# Test with minimal payload
./scripts/test-push-notification.sh minimal
```

### Webhook Processing Failures

**Symptoms:**
- Webhooks not triggering notification events
- Error 500 in webhook logs

**Solutions:**
```bash
# Run webhook processor locally to debug
./scripts/run-webhook-worker.sh

# Clean up any stuck notifications
./scripts/cleanup-notifications.sh
```

## Emergency Pipeline Recovery

If the pipeline is completely broken and you need an emergency fix:

1. **Trigger manual build:**
```bash
eas build --platform ios --profile production --non-interactive --no-wait
```

2. **Force push to specific distribution channel:**
```bash
eas channel:edit production --branch main
```

3. **Skip problematic steps:**
```bash
# Create temporary .easignore to exclude problematic files
echo "ios/Pods/" >> .easignore
echo "android/.gradle/" >> .easignore
git add .easignore
git commit -m "temp: Skip problematic files in emergency build"
git push
```

4. **Revert to last known good build:**
```bash
git checkout <last-good-commit-hash>
git branch emergency-build
git push -u origin emergency-build
eas build --platform all --profile production --branch emergency-build
```

## Contact Points for Critical Issues

If you can't resolve the pipeline issue, contact:

- **iOS Native Issues:** iOS Lead Engineer (Slack: @ios-lead)
- **Android Native Issues:** Android Lead Engineer (Slack: @android-lead)
- **CI/CD Pipeline:** DevOps Engineer (Slack: @devops)
- **Supabase Backend:** Backend Engineer (Slack: @backend-lead)

For emergency production issues, use the #careai-alerts Slack channel. 