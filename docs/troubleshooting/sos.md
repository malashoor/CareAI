# SOS Troubleshooting Guide

## Overview

This guide covers common issues, error codes, and solutions for the CareAI SOS system. The system handles:
- Emergency alerts
- Location tracking
- Contact notifications
- Emergency response coordination
- Fall detection

## Common Issues

### 1. Emergency Alerts

#### Error Codes
```
SOS_001: Alert failed to send
SOS_002: Contact notification failed
SOS_003: Location unavailable
SOS_004: Network error
```

#### Symptoms
- SOS button not responding
- Delayed alert delivery
- Failed contact notifications
- Location tracking issues

#### Diagnostic Steps
```bash
# Check alert system
npm run sos:check-alerts

# Verify contact system
npm run sos:verify-contacts

# Test location services
npm run sos:test-location
```

#### Logs to Check
```bash
# View alert logs
npm run logs:sos-alerts

# Check contact status
npm run logs:contact-status

# Monitor location tracking
npm run logs:location-tracking
```

### 2. Location Tracking

#### Error Codes
```
LOC_001: GPS unavailable
LOC_002: Permission denied
LOC_003: Background location disabled
LOC_004: Accuracy issues
```

#### Symptoms
- Location not updating
- Poor accuracy
- Background tracking fails
- Battery drain

#### Diagnostic Steps
```bash
# Check GPS status
npm run sos:check-gps

# Verify permissions
npm run sos:verify-permissions

# Test accuracy
npm run sos:test-accuracy
```

#### Logs to Check
```bash
# View location logs
npm run logs:location

# Check GPS status
npm run logs:gps-status

# Monitor accuracy
npm run logs:accuracy-metrics
```

### 3. Fall Detection

#### Error Codes
```
FALL_001: Sensor unavailable
FALL_002: Calibration needed
FALL_003: False positive
FALL_004: Detection disabled
```

#### Symptoms
- Falls not detected
- False alarms
- Delayed detection
- Sensor issues

#### Diagnostic Steps
```bash
# Check sensors
npm run sos:check-sensors

# Test detection
npm run sos:test-detection

# Verify calibration
npm run sos:verify-calibration
```

#### Logs to Check
```bash
# View fall detection logs
npm run logs:fall-detection

# Check sensor status
npm run logs:sensor-status

# Monitor detection accuracy
npm run logs:detection-metrics
```

## Platform-Specific Issues

### iOS
1. **Background Location**
```bash
# Check background modes
npm run ios:check-background

# Verify location permissions
npm run ios:verify-location

# Test background updates
npm run ios:test-background
```

Common Issues:
- Background location requires "Always" permission
- Significant location changes may be throttled
- Background refresh must be enabled
- Location accuracy varies by device model
- Battery optimization affects update frequency

2. **Emergency Services**
```bash
# Check emergency services
npm run ios:check-emergency

# Test emergency calls
npm run ios:test-emergency

# Verify contact access
npm run ios:verify-contacts
```

Common Issues:
- Emergency calls require special entitlements
- Contact access requires explicit permission
- Background audio session needed for calls
- CallKit integration required
- Privacy restrictions on contact sharing

3. **Motion Sensors**
```bash
# Check motion sensors
npm run ios:check-motion

# Test fall detection
npm run ios:test-fall

# Verify sensor accuracy
npm run ios:verify-sensors
```

Common Issues:
- CoreMotion requires background mode
- Sensor data may be throttled
- Device orientation affects accuracy
- Battery impact on continuous monitoring
- Calibration needed for accurate detection

### Android
1. **Background Services**
```bash
# Check service status
npm run android:check-service

# Verify wake locks
npm run android:verify-wake-locks

# Test background behavior
npm run android:test-background
```

Common Issues:
- Foreground service required for reliability
- Doze mode affects service behavior
- Manufacturer-specific battery optimization
- Background location restrictions
- Service priority affects reliability

2. **Location Services**
```bash
# Check location services
npm run android:check-location

# Test location updates
npm run android:test-location

# Verify accuracy
npm run android:verify-accuracy
```

Common Issues:
- Background location permission required
- Location updates may be delayed
- GPS accuracy varies by device
- Battery optimization impacts updates
- Manufacturer-specific restrictions

3. **Emergency Features**
```bash
# Check emergency features
npm run android:check-emergency

# Test emergency calls
npm run android:test-emergency

# Verify contact access
npm run android:verify-contacts
```

Common Issues:
- Emergency calls require special permissions
- Contact access varies by Android version
- Background call handling
- Manufacturer-specific dialer integration
- Privacy restrictions on contact sharing

### Web (Future Support)
1. **Location Services**
```bash
# Check location API
npm run web:check-location

# Test geolocation
npm run web:test-geo

# Verify accuracy
npm run web:verify-accuracy
```

Common Issues:
- Geolocation API limitations
- Accuracy varies by browser
- HTTPS required
- Permission handling
- Battery impact

2. **Emergency Contacts**
```bash
# Check contact API
npm run web:check-contacts

# Test contact access
npm run web:test-contacts

# Verify permissions
npm run web:verify-permissions
```

Common Issues:
- Contact API support varies
- Permission handling
- Data format differences
- Privacy restrictions
- Cross-browser compatibility

3. **Background Processing**
```bash
# Check background tasks
npm run web:check-background

# Test service worker
npm run web:test-sw

# Verify reliability
npm run web:verify-reliability
```

Common Issues:
- Service worker limitations
- Background sync restrictions
- Battery optimization
- Network dependency
- Storage limitations

## Testing Commands

### 1. End-to-End Testing
```bash
# Run SOS tests
npm run test:sos

# Test specific scenarios
npm run test:sos -- --grep "emergency"
npm run test:sos -- --grep "location"
npm run test:sos -- --grep "fall"
```

### 2. Performance Testing
```bash
# Test response time
npm run test:sos-performance

# Check battery impact
npm run test:sos-battery

# Verify accuracy
npm run test:sos-accuracy
```

### 3. Load Testing
```bash
# Simulate multiple alerts
npm run test:sos-load

# Test concurrent tracking
npm run test:sos-concurrent

# Verify system limits
npm run test:sos-limits
```

## Rollback Procedures

### 1. Alert System Rollback
```bash
# Revert alert changes
npm run sos:rollback-alerts

# Restore alert settings
npm run sos:restore-alerts

# Verify alert system
npm run sos:verify-alerts
```

### 2. Location System Rollback
```bash
# Revert location changes
npm run sos:rollback-location

# Restore location settings
npm run sos:restore-location

# Verify location system
npm run sos:verify-location
```

### 3. Fall Detection Rollback
```bash
# Revert detection changes
npm run sos:rollback-detection

# Restore detection settings
npm run sos:restore-detection

# Verify detection system
npm run sos:verify-detection
```

## Monitoring & Alerts

### 1. Key Metrics
- Alert success rate
- Location accuracy
- Fall detection accuracy
- Response time
- Battery impact

### 2. Alert Thresholds
```bash
# Configure SOS alerts
npm run sos:configure-alerts

# Set error thresholds
npm run sos:set-thresholds

# Monitor alert status
npm run sos:monitor-alerts
```

### 3. Health Checks
```bash
# Run health check
npm run sos:health-check

# Verify all components
npm run sos:verify-all

# Generate health report
npm run sos:health-report
```

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

- [iOS Location Services](https://developer.apple.com/documentation/corelocation)
- [Android Location Services](https://developer.android.com/training/location)
- [Web Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Cross-Platform Testing](https://docs.expo.dev/guides/testing/) 