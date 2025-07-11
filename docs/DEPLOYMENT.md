# CareAI Deployment Guide

## Overview

CareAI is a comprehensive healthcare management platform that integrates multiple services:

- **Frontend**: React Native mobile app (iOS & Android)
- **Backend**: Supabase for database, authentication, and real-time features
- **Notifications**: Push notification system for alerts and reminders
- **Monitoring**: Sentry for error tracking and Datadog for performance monitoring
- **Analytics**: Custom analytics dashboard for business metrics

### Environment Variables

Required environment variables for deployment:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Push Notifications
EXPO_PUSH_TOKEN=your_expo_push_token
FIREBASE_SERVER_KEY=your_firebase_server_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key

# Analytics
MIXPANEL_TOKEN=your_mixpanel_token
```

## Setup Steps

### 1. Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/careai.git
cd careai
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration values

### 2. Supabase Setup

1. Create a new Supabase project
2. Run database migrations:
```bash
npm run supabase:migrate
```

3. Set up Row Level Security (RLS) policies:
```bash
npm run supabase:setup-rls
```

4. Configure real-time subscriptions:
```bash
npm run supabase:setup-realtime
```

### 3. Push Notification Configuration

1. Set up Expo Push Notifications:
```bash
expo login
expo push:configure
```

2. Configure Firebase Cloud Messaging:
- Create a Firebase project
- Add your iOS and Android apps
- Download and add configuration files
- Set up server key

### 4. Monitoring Setup

1. Sentry Configuration:
```bash
npm run sentry:setup
```

2. Datadog Configuration:
```bash
npm run datadog:setup
```

## Build & Release Process

### iOS & Android Builds

1. Configure EAS Build:
```bash
eas build:configure
```

2. Create build profiles in `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

3. Build for iOS:
```bash
eas build --platform ios --profile production
```

4. Build for Android:
```bash
eas build --platform android --profile production
```

### Versioning

1. Update version numbers:
```bash
npm version patch|minor|major
```

2. Tag releases:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Post-Deployment Checks

### 1. Health Monitoring

1. Check Supabase health:
```bash
npm run health:check-supabase
```

2. Verify push notification delivery:
```bash
npm run health:check-notifications
```

3. Monitor error rates:
```bash
npm run health:check-errors
```

### 2. Feature Sanity Checks

1. Test core features:
- Chat functionality
- SOS system
- Notification delivery
- Real-time updates

2. Verify analytics tracking:
```bash
npm run health:check-analytics
```

### 3. Performance Monitoring

1. Check response times:
```bash
npm run health:check-performance
```

2. Monitor memory usage:
```bash
npm run health:check-memory
```

## Rollbacks & Hotfixes

### 1. App Rollback

1. Revert to previous version:
```bash
eas build:rollback
```

2. Update app store listings if necessary

### 2. Database Rollback

1. Revert Supabase migrations:
```bash
npm run supabase:rollback
```

2. Verify data integrity:
```bash
npm run supabase:verify
```

### 3. Hotfix Process

1. Create hotfix branch:
```bash
git checkout -b hotfix/issue-description
```

2. Apply fix and test:
```bash
npm run test
npm run test:e2e
```

3. Deploy hotfix:
```bash
eas build --profile production
```

## Security Considerations

1. Regular security audits:
```bash
npm run security:audit
```

2. Update dependencies:
```bash
npm run security:update-deps
```

3. Monitor for vulnerabilities:
```bash
npm run security:scan
```

## Scaling Considerations

1. Monitor database performance:
```bash
npm run scale:check-db
```

2. Optimize real-time subscriptions:
```bash
npm run scale:optimize-realtime
```

3. Configure auto-scaling:
```bash
npm run scale:configure
```

## Troubleshooting

### 1. Expo Build Issues

#### Common EAS Build Errors

1. **Missing Credentials**
```bash
Error: Missing Apple Developer credentials
```
Solution:
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure credentials
eas credentials

# For iOS, ensure you have:
eas credentials:ios

# For Android, ensure you have:
eas credentials:android
```

2. **M1 Mac Build Issues**
```bash
Error: Rosetta 2 required for x86_64 architecture
```
Solution:
```bash
# Install Rosetta 2
softwareupdate --install-rosetta

# Clear build cache
eas build:clean

# Rebuild with specific architecture
eas build --platform ios --profile production --clear-cache
```

3. **Fastlane/App Store Upload Failures**
```bash
Error: Failed to upload to App Store Connect
```
Solution:
```bash
# Verify certificates
eas credentials:ios

# Check provisioning profiles
eas credentials:ios --list

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Retry with verbose logging
eas build --platform ios --profile production --verbose
```

### 2. Supabase Sync/Offline Issues

#### Local Cache Not Syncing

1. **Check Sync Status**
```bash
# View sync queue
npm run supabase:sync-status

# Force sync
npm run supabase:force-sync
```

2. **Clear Local Cache**
```bash
# Clear app cache
npm run cache:clear

# Reset local database
npm run supabase:reset-local
```

3. **Rate Limit Issues**
```bash
Error: Too many requests
```
Solution:
```bash
# Check current rate limits
npm run supabase:check-limits

# Implement exponential backoff
npm run supabase:configure-backoff
```

4. **Token Expiration**
```bash
Error: JWT expired
```
Solution:
```bash
# Refresh token
npm run auth:refresh-token

# Verify token validity
npm run auth:verify-token
```

### 3. Push Notification Failures

#### Expo Push Token Issues

1. **Invalid Push Token**
```bash
Error: Invalid push token
```
Solution:
```bash
# Verify token format
npm run notifications:verify-token

# Regenerate token
npm run notifications:regenerate-token
```

2. **iOS Silent Notifications**
```bash
Error: Silent notification not delivered
```
Solution:
```bash
# Check background modes
npm run ios:check-background-modes

# Verify notification permissions
npm run notifications:check-permissions

# Test silent notification
npm run notifications:test-silent
```

3. **Foreground Voice Playback**
```bash
Error: Voice notification not playing
```
Solution:
```bash
# Check audio session
npm run ios:check-audio-session

# Verify voice permissions
npm run notifications:check-voice-permissions

# Test voice playback
npm run notifications:test-voice
```

### 4. Voice Feedback Bugs

#### Platform-Specific TTS Issues

1. **Android Speech Issues**
```bash
Error: Text-to-speech not working
```
Solution:
```bash
# Check TTS engine
npm run android:check-tts

# Verify language support
npm run android:check-tts-languages

# Test TTS fallback
npm run android:test-tts-fallback
```

2. **iOS Speech Delay**
```bash
Error: Speech synthesis delayed
```
Solution:
```bash
# Check audio session priority
npm run ios:check-audio-priority

# Verify speech synthesis queue
npm run ios:check-speech-queue

# Test speech timing
npm run ios:test-speech-timing
```

3. **Speech Synthesis Fallback**
```bash
Error: Primary TTS engine failed
```
Solution:
```bash
# Configure fallback engines
npm run tts:configure-fallback

# Test fallback chain
npm run tts:test-fallback-chain

# Monitor TTS performance
npm run tts:monitor-performance
```

### 5. Real-time Sync Issues

1. **Connection Drops**
```bash
Error: Real-time connection lost
```
Solution:
```bash
# Check connection status
npm run realtime:check-connection

# Configure reconnection
npm run realtime:configure-reconnect

# Test connection stability
npm run realtime:test-connection
```

2. **Subscription Channel Issues**
```bash
Error: Channel subscription failed
```
Solution:
```bash
# List active subscriptions
npm run realtime:list-subscriptions

# Verify channel permissions
npm run realtime:check-permissions

# Test channel connectivity
npm run realtime:test-channel
```

### 6. Performance Issues

1. **Memory Leaks**
```bash
Error: High memory usage
```
Solution:
```bash
# Check memory usage
npm run performance:check-memory

# Profile memory allocation
npm run performance:profile-memory

# Clean up resources
npm run performance:cleanup
```

2. **Slow Response Times**
```bash
Error: API response time exceeded
```
Solution:
```bash
# Check API performance
npm run performance:check-api

# Profile network requests
npm run performance:profile-network

# Optimize queries
npm run performance:optimize-queries
```

### 7. App Store Review Issues

1. **Metadata Rejection**
```bash
Error: App Store metadata rejected
```
Solution:
```bash
# Verify metadata
npm run appstore:verify-metadata

# Check screenshots
npm run appstore:verify-screenshots

# Validate keywords
npm run appstore:validate-keywords
```

2. **Binary Rejection**
```bash
Error: Binary rejected
```
Solution:
```bash
# Check binary size
npm run appstore:check-binary-size

# Verify entitlements
npm run appstore:verify-entitlements

# Test on TestFlight
npm run appstore:test-testflight
```

### 8. Analytics & Monitoring Issues

1. **Data Discrepancies**
```bash
Error: Analytics data mismatch
```
Solution:
```bash
# Verify tracking implementation
npm run analytics:verify-tracking

# Check data pipeline
npm run analytics:check-pipeline

# Test event delivery
npm run analytics:test-events
```

2. **Monitoring Alerts**
```bash
Error: False positive alerts
```
Solution:
```bash
# Review alert thresholds
npm run monitoring:review-thresholds

# Check alert configuration
npm run monitoring:check-config

# Test alert conditions
npm run monitoring:test-alerts
```

## Support & Maintenance

1. Regular maintenance tasks:
```bash
npm run maintenance:cleanup
npm run maintenance:optimize
```

2. Backup procedures:
```bash
npm run maintenance:backup
```

3. Update procedures:
```bash
npm run maintenance:update
```

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Sentry Documentation](https://docs.sentry.io)
- [Datadog Documentation](https://docs.datadoghq.com) 