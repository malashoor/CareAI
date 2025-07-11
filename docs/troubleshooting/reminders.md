# Reminders Troubleshooting Guide

## Overview

This guide covers common issues, error codes, and solutions for the CareAI reminders system. The system handles:
- Medication reminders
- Appointment scheduling
- Daily task reminders
- Recurring reminders
- Reminder notifications

## Common Issues

### 1. Reminder Scheduling

#### Error Codes
```
REM_001: Schedule conflict
REM_002: Invalid time format
REM_003: Recurrence error
REM_004: Timezone mismatch
```

#### Symptoms
- Reminders not scheduling
- Wrong reminder times
- Duplicate reminders
- Missing reminders

#### Diagnostic Steps
```bash
# Check schedule conflicts
npm run reminders:check-conflicts

# Verify time formats
npm run reminders:verify-times

# Test recurrence rules
npm run reminders:test-recurrence
```

#### Logs to Check
```bash
# View reminder logs
npm run logs:reminders

# Check schedule status
npm run logs:schedule-status

# Monitor timezone handling
npm run logs:timezone-status
```

### 2. Notification Delivery

#### Error Codes
```
NOTIF_001: Delivery failed
NOTIF_002: Silent notification error
NOTIF_003: Background fetch failed
NOTIF_004: Permission denied
```

#### Symptoms
- Notifications not received
- Delayed notifications
- Missing notifications
- Permission issues

#### Diagnostic Steps
```bash
# Check notification permissions
npm run reminders:check-permissions

# Test notification delivery
npm run reminders:test-delivery

# Verify background fetch
npm run reminders:verify-background
```

#### Logs to Check
```bash
# View notification logs
npm run logs:notifications

# Check delivery status
npm run logs:delivery-status

# Monitor permission status
npm run logs:permission-status
```

### 3. Data Sync

#### Error Codes
```
SYNC_001: Sync conflict
SYNC_002: Offline update failed
SYNC_003: Version mismatch
SYNC_004: Data corruption
```

#### Symptoms
- Reminders not syncing
- Data inconsistencies
- Offline updates failing
- Version conflicts

#### Diagnostic Steps
```bash
# Check sync status
npm run reminders:check-sync

# Test offline updates
npm run reminders:test-offline

# Verify data integrity
npm run reminders:verify-data
```

#### Logs to Check
```bash
# View sync logs
npm run logs:sync

# Check conflict status
npm run logs:conflict-status

# Monitor version status
npm run logs:version-status
```

## Testing Commands

### 1. End-to-End Testing
```bash
# Run reminder tests
npm run test:reminders

# Test specific scenarios
npm run test:reminders -- --grep "scheduling"
npm run test:reminders -- --grep "notifications"
npm run test:reminders -- --grep "sync"
```

### 2. Performance Testing
```bash
# Test scheduling performance
npm run test:reminders-performance

# Check memory usage
npm run test:reminders-memory

# Verify notification timing
npm run test:reminders-timing
```

### 3. Load Testing
```bash
# Simulate high reminder volume
npm run test:reminders-load

# Test concurrent reminders
npm run test:reminders-concurrent

# Verify system limits
npm run test:reminders-limits
```

## Rollback Procedures

### 1. Schedule Rollback
```bash
# Revert schedule changes
npm run reminders:rollback-schedule

# Restore reminder times
npm run reminders:restore-times

# Verify schedule integrity
npm run reminders:verify-schedule
```

### 2. Notification Rollback
```bash
# Revert notification changes
npm run reminders:rollback-notifications

# Restore notification settings
npm run reminders:restore-notifications

# Verify notification system
npm run reminders:verify-notifications
```

### 3. Data Rollback
```bash
# Revert data changes
npm run reminders:rollback-data

# Restore data integrity
npm run reminders:restore-data

# Verify data consistency
npm run reminders:verify-data
```

## Monitoring & Alerts

### 1. Key Metrics
- Reminder delivery rate
- Notification success rate
- Sync success rate
- Schedule conflict rate
- System performance

### 2. Alert Thresholds
```bash
# Configure reminder alerts
npm run reminders:configure-alerts

# Set error thresholds
npm run reminders:set-thresholds

# Monitor alert status
npm run reminders:monitor-alerts
```

### 3. Health Checks
```bash
# Run health check
npm run reminders:health-check

# Verify all components
npm run reminders:verify-all

# Generate health report
npm run reminders:health-report
```

## Platform-Specific Issues

### iOS
1. **Background Refresh Issues**
```bash
# Check background refresh
npm run ios:check-background

# Verify capabilities
npm run ios:verify-capabilities

# Test background scheduling
npm run ios:test-background
```

2. **Notification Issues**
```bash
# Check notification permissions
npm run ios:check-notifications

# Test notification delivery
npm run ios:test-notifications

# Verify notification settings
npm run ios:verify-notifications
```

### Android
1. **Battery Optimization**
```bash
# Check battery settings
npm run android:check-battery

# Test background impact
npm run android:test-background

# Verify wake locks
npm run android:verify-wake-locks
```

2. **Doze Mode**
```bash
# Check doze mode
npm run android:check-doze

# Test doze impact
npm run android:test-doze

# Verify alarm manager
npm run android:verify-alarms
```

## Best Practices

1. **Scheduling**
- Handle timezone changes
- Manage schedule conflicts
- Implement retry logic

2. **Notifications**
- Handle permission changes
- Manage notification channels
- Implement fallback options

3. **Data Management**
- Handle offline updates
- Manage sync conflicts
- Implement data validation

4. **Performance**
- Optimize background tasks
- Manage system resources
- Handle high volume

## Support Resources

- [Background Tasks Guide](https://docs.expo.dev/versions/latest/sdk/background-fetch/)
- [Notifications Guide](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Data Sync Guide](https://supabase.io/docs/guides/realtime)
- [Performance Guide](https://docs.expo.dev/versions/latest/performance/) 