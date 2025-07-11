# Push Notification Field Testing Guide

This guide explains how to test push notifications for the CareAI application during field trials and development.

## Overview

The push notification system in CareAI is used for critical alerts and updates to different user types:

- **Seniors**: Get medication reminders and check-in requests
- **Family Members**: Receive alerts about their senior relatives
- **Health Professionals**: Monitor critical health events for their patients

To ensure reliable delivery of these notifications, we have a field testing system that allows you to:

1. Register device tokens for testing
2. Send test notifications to specific devices
3. Track delivery status and debug issues

## Prerequisites

- A device with the CareAI app installed
- Your device's push notification token (visible in the app's debug screen)
- `jq` command-line utility installed (for JSON processing)
- Network access to the Supabase API

## Testing Tools

### 1. Push Notification Test Script

The `scripts/test-push-notification-field.sh` script provides a command-line interface for testing notifications:

```bash
# Register a device for testing
./scripts/test-push-notification-field.sh --register <device_token> <device_name> <user_id>

# Send a test notification
./scripts/test-push-notification-field.sh --test <event_type> [user_id]

# Check notification status
./scripts/test-push-notification-field.sh --status <notification_id>
```

#### Event Types

The system supports testing the following event types:

- `sos_triggered`: Emergency SOS button press (highest priority)
- `medication_missed`: Missed medication alerts
- `vital_anomaly`: Abnormal vital signs detected
- `emotion_change`: Changes in emotional state

### 2. In-App Debug Screen

The app includes a notification debug screen accessible from the Settings menu. This screen shows:

- Device information (OS, app version)
- Current push notification token
- Recent notification history
- Delivery statistics

## Field Testing Workflow

Follow these steps to test the notification system in the field:

### Step 1: Get the Device Token

1. Open the CareAI app on your test device
2. Go to Settings > Debug Info
3. Copy the Expo Push Token displayed on screen

### Step 2: Register the Device

```bash
./scripts/test-push-notification-field.sh --register "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" "John's iPhone 13" "auth0|123456789"
```

### Step 3: Send Test Notifications

```bash
# Test SOS alert
./scripts/test-push-notification-field.sh --test sos_triggered auth0|123456789

# Test missed medication alert
./scripts/test-push-notification-field.sh --test medication_missed auth0|123456789
```

### Step 4: Verify Delivery

1. Check if the notification appears on the device
2. Note the time it takes to arrive
3. Check the notification status in the system:

```bash
./scripts/test-push-notification-field.sh --status 12345678-1234-1234-1234-123456789012
```

### Step 5: Debug Issues

If notifications aren't being delivered:

1. Check the app's notification permissions
2. Verify the device is online
3. Review the notification debug screen in the app
4. Check the server logs for delivery errors

## Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| No notifications arriving | Device in Do Not Disturb mode | Check device settings |
| Delayed notifications | Poor network connectivity | Test on different network |
| Missing notification token | App permissions issue | Reinstall app or check permissions |
| "Invalid token" error | Expired or malformed token | Re-register device token |

## Additional Resources

- [Expo Push Notification Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Notification Delivery Dashboard](https://supabase.com/dashboard/project/wvuyppurctdosfvlefkk/editor?table=notifications)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Support

If you encounter issues with the notification system during field testing, please contact the development team with the following information:

- Device model and OS version
- App version
- Notification ID (if available)
- Steps to reproduce the issue
- Screenshots of the debug screen 