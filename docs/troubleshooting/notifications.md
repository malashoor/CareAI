# Notifications Troubleshooting Guide

## Overview

This guide covers common issues, error codes, and solutions for the CareAI notifications system. The system handles:
- Push notifications (iOS & Android)
- In-app notifications
- Voice notifications
- Notification preferences
- Real-time updates

## Common Issues

### 1. Push Notification Delivery

#### Error Codes
```
PUSH_001: Invalid push token
PUSH_002: Token expired
PUSH_003: Device not registered
PUSH_004: Rate limit exceeded
```

#### Symptoms
- Notifications not appearing on device
- Delayed notification delivery
- Inconsistent delivery across devices

#### Diagnostic Steps
```bash
# Check push token validity
npm run notifications:verify-token

# Test push delivery
npm run notifications:test-push

# Monitor delivery rates
npm run notifications:monitor-delivery
```

#### Logs to Check
```bash
# View push notification logs
npm run logs:push

# Check delivery status
npm run logs:delivery-status

# Monitor error rates
npm run logs:error-rates
```

### 2. In-App Notifications

#### Error Codes
```
INAPP_001: Real-time sync failed
INAPP_002: Cache miss
INAPP_003: Permission denied
INAPP_004: Rate limit exceeded
```

#### Symptoms
- Notifications not appearing in app
- Duplicate notifications
- Missing notification content

#### Diagnostic Steps
```bash
# Check real-time connection
npm run notifications:check-realtime

# Verify cache status
npm run notifications:check-cache

# Test in-app delivery
npm run notifications:test-inapp
```

#### Logs to Check
```bash
# View in-app notification logs
npm run logs:inapp

# Check sync status
npm run logs:sync-status

# Monitor cache hits/misses
npm run logs:cache-stats
```

### 3. Voice Notifications

#### Error Codes
```
VOICE_001: TTS engine failed
VOICE_002: Audio session error
VOICE_003: Permission denied
VOICE_004: Resource unavailable
```

#### Symptoms
- Voice not playing
- Delayed voice playback
- Inconsistent voice quality

#### Diagnostic Steps
```bash
# Check TTS engine
npm run notifications:check-tts

# Verify audio session
npm run notifications:check-audio

# Test voice playback
npm run notifications:test-voice
```

#### Logs to Check
```bash
# View voice notification logs
npm run logs:voice

# Check TTS engine status
npm run logs:tts-status

# Monitor audio session
npm run logs:audio-session
```

## Testing Commands

### 1. End-to-End Testing
```bash
# Run notification tests
npm run test:notifications

# Test specific scenarios
npm run test:notifications -- --grep "push"
npm run test:notifications -- --grep "voice"
npm run test:notifications -- --grep "inapp"
```

### 2. Performance Testing
```bash
# Test notification delivery speed
npm run test:notifications-performance

# Check memory usage
npm run test:notifications-memory

# Verify real-time sync
npm run test:notifications-realtime
```

### 3. Load Testing
```bash
# Simulate high notification volume
npm run test:notifications-load

# Test concurrent notifications
npm run test:notifications-concurrent

# Verify rate limiting
npm run test:notifications-rate-limit
```

## Rollback Procedures

### 1. Push Notification Rollback
```bash
# Revert to previous push configuration
npm run notifications:rollback-push

# Restore previous tokens
npm run notifications:restore-tokens

# Verify rollback
npm run notifications:verify-rollback
```

### 2. In-App Notification Rollback
```bash
# Revert real-time configuration
npm run notifications:rollback-realtime

# Restore cache
npm run notifications:restore-cache

# Verify functionality
npm run notifications:verify-inapp
```

### 3. Voice Notification Rollback
```bash
# Revert TTS configuration
npm run notifications:rollback-tts

# Restore audio settings
npm run notifications:restore-audio

# Verify voice playback
npm run notifications:verify-voice
```

## Monitoring & Alerts

### 1. Key Metrics
- Delivery success rate
- Average delivery time
- Error rate
- Cache hit rate
- Voice playback success rate

### 2. Alert Thresholds
```bash
# Configure delivery alerts
npm run notifications:configure-alerts

# Set error thresholds
npm run notifications:set-thresholds

# Monitor alert status
npm run notifications:monitor-alerts
```

### 3. Health Checks
```bash
# Run health check
npm run notifications:health-check

# Verify all components
npm run notifications:verify-all

# Generate health report
npm run notifications:health-report
```

## Platform-Specific Issues

### iOS
1. **Push Notification Permissions**
```bash
# Check permission status
npm run ios:check-permissions

# Verify notification settings
npm run ios:verify-settings

# Test permission prompts
npm run ios:test-prompts
```

Common Issues:
- Silent notification permissions require explicit user consent
- Background refresh must be enabled for reliable delivery
- Notification categories must be registered before use
- Provisional authorization may be needed for critical alerts

2. **Background Mode Limitations**
```bash
# Check background modes
npm run ios:check-background

# Verify capabilities
npm run ios:verify-capabilities

# Test background delivery
npm run ios:test-background
```

Common Issues:
- Background fetch intervals are system-controlled
- Silent notifications may be throttled
- Background processing time is limited
- System may terminate background tasks

3. **TTS and Voice Integration**
```bash
# Check voice capabilities
npm run ios:check-voice

# Test TTS integration
npm run ios:test-tts

# Verify audio session
npm run ios:verify-audio
```

Common Issues:
- TTS requires active audio session
- Voice playback may be interrupted
- Background audio must be configured
- Audio session conflicts with other apps

### Android
1. **Battery Optimization Impact**
```bash
# Check battery optimization
npm run android:check-battery

# Test optimization impact
npm run android:test-battery

# Verify wake locks
npm run android:verify-wake-locks
```

Common Issues:
- Doze mode may delay notifications
- Background restrictions vary by manufacturer
- Battery optimization may kill background services
- Wake locks must be properly managed

2. **Push Token Management**
```bash
# Check token registration
npm run android:check-tokens

# Test token refresh
npm run android:test-refresh

# Verify FCM setup
npm run android:verify-fcm
```

Common Issues:
- FCM tokens may change after app updates
- Token refresh must be handled manually
- Background service must be registered
- Firebase configuration must be valid

3. **Background Service Limitations**
```bash
# Check service status
npm run android:check-service

# Test background behavior
npm run android:test-background

# Verify service priority
npm run android:verify-priority
```

Common Issues:
- Background services may be killed
- Foreground service notification required
- Service priority affects reliability
- Manufacturer-specific restrictions

### Web (Future Support)
1. **Browser Compatibility**
```bash
# Check browser support
npm run web:check-browser

# Test notification API
npm run web:test-notifications

# Verify service worker
npm run web:verify-sw
```

Common Issues:
- Notification API support varies
- Service worker registration required
- HTTPS required for notifications
- Browser-specific limitations

2. **Cross-Platform Sync**
```bash
# Check sync status
npm run web:check-sync

# Test cross-device
npm run web:test-cross-device

# Verify state management
npm run web:verify-state
```

Common Issues:
- State synchronization across platforms
- Offline support limitations
- Storage quota restrictions
- Cache management

3. **Progressive Web App (PWA)**
```bash
# Check PWA status
npm run web:check-pwa

# Test installation
npm run web:test-install

# Verify offline support
npm run web:verify-offline
```

Common Issues:
- Installation prompt behavior
- Offline functionality
- Update management
- Storage limitations

## Best Practices

1. **Platform-Specific Handling**
- Implement platform-specific permission flows
- Handle background mode differences
- Manage battery optimization impact
- Support web-specific features

2. **Cross-Platform Testing**
- Test on multiple iOS versions
- Verify on different Android manufacturers
- Check web browser compatibility
- Validate cross-device sync

3. **Performance Optimization**
- Minimize battery impact
- Optimize background processing
- Handle platform-specific limitations
- Implement efficient sync

4. **Error Handling**
- Handle platform-specific errors
- Implement graceful fallbacks
- Log platform-specific issues
- Monitor platform-specific metrics

## Support Resources

- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [Android FCM Guide](https://firebase.google.com/docs/cloud-messaging)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Cross-Platform Testing](https://docs.expo.dev/guides/testing/) 