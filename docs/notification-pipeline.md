# Notification Pipeline

This document outlines the notification pipeline architecture for CareAI.

## Overview

The notification pipeline is designed to route events from various sources to appropriate recipients through multiple channels. It consists of these key components:

1. **Event Sources**: Vitals monitoring, medication reminders, SOS buttons, emotion detection
2. **Edge Function**: Processes events, applies routing rules, and creates notification records
3. **Delivery Workers**: Channel-specific workers for push notifications, email, in-app notifications, etc.

## Database Schema

The pipeline uses the following tables:

- `routing_rules`: Defines which events go to which recipients via which channels
- `notifications`: Tracks notification delivery status
- `notification_preferences`: Stores user preferences for notification channels and quiet hours
- `device_tokens`: Stores device tokens for push notifications

## Implementation Steps

### 1. Database Migration

The migration file `supabase/migrations/20240514000000_notification_pipeline_core.sql` creates all required tables and seed data.

To apply the migration:

```bash
npx supabase db push
```

### 2. Edge Function Deployment

The Edge Function is located at `supabase/functions/notify-poc/index.ts`.

To deploy the function:

```bash
npx supabase functions deploy notify-poc
```

### 3. Test the Pipeline

Use the provided curl script to test the pipeline:

```bash
./scripts/test-curl.sh
```

Make sure to update the script with your Supabase project URL and auth token first.

## Event Schema

Events sent to the pipeline must conform to this schema:

```json
{
  "id": "unique-event-id",
  "timestamp": "2023-05-15T12:00:00Z",
  "source": "vitals|medication|sos|system|emotion",
  "severity": "critical|warning|info",
  "recipientRoles": ["family", "healthpro"],
  "payload": {
    "title": "Event title",
    "body": "Event description",
    "data": {
      "key1": "value1",
      "key2": "value2"
    }
  }
}
```

## Routing Rules

Routing rules determine which events are delivered to which recipients through which channels. Default rules include:

- Critical SOS alerts go to family and health professionals via push, SMS, and in-app (override quiet hours)
- Vital sign anomalies go to health professionals via push and in-app
- Missed medication alerts go to family and health professionals via push and in-app
- Emotion state changes go to family members via in-app only

## Next Steps

1. Implement delivery workers for each channel (push, email, in-app)
2. Add settings UI for notification preferences
3. Create monitoring dashboards for notification metrics 