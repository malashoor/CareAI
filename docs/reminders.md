# Reminders System Troubleshooting

## 🧩 Overview
The Reminders system manages scheduled notifications, recurring alerts, emotion-aware prompts, and voice playback. It integrates with the health monitoring, emotion engine, and notification system.

---

## ⚠️ Common Issues

| Issue | Error Code / Behavior | Platform |
|-------|------------------------|----------|
| Reminder doesn't trigger | `ReminderSkipped` / No alert | Android (Doze mode), iOS (BG limitations) |
| Voice not played | `TTSNotAvailable` | Android < API 23 |
| Reminder duplicated | `ReminderCollision` | All |
| Reminders silent | `NotificationChannelMissing` | Android |
| Emotion-triggered reminder failed | `EmotionSyncTimeout` | All |

---

## 🔍 Diagnostic Steps

1. Check `ScheduledReminders` table (Supabase or local cache)
2. Confirm notification permissions (`expo-permissions`)
3. Run platform-specific diagnostics:
   ```bash
   # Android alarm manager state
   adb shell dumpsys alarm
   
   # iOS reminder logs
   xcrun simctl spawn booted log stream --predicate 'eventMessage contains "reminder"'
   ```

## 🛠️ Rollback Procedures

1. Revert to backup notification channel config
2. Clear scheduled reminders:
   ```javascript
   Notifications.cancelAllScheduledNotificationsAsync();
   ```
3. Re-register all reminders after time sync

## ⚡ Quick Recovery Script

Copy-paste this script to reset reminder state instantly:

```javascript
// Quick Reset Script
async function resetReminderState() {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Clear local cache
    await clearLocalRemindersCache();
    
    // Sync from Supabase
    await syncRemindersFromSupabase();
    
    console.log('Reminder state reset complete');
  } catch (error) {
    console.error('Reset failed:', error);
  }
}
```

## 🔎 Platform-Specific Issues

### iOS
- Reminders may not trigger unless BGTaskScheduler and "Always Allow" background mode is enabled
- Voice reminders may not play with silent switch on
- TTS requires AVAudioSession configuration in foreground

### Android
- Must use foreground services for reliable reminders on recent Android versions
- App may be killed by battery optimization (e.g., Samsung, Xiaomi)
- Notification channel must be created manually with sound/vibration config

#### Known Manufacturer Quirks
- **Samsung**: Aggressive battery optimization requires manual app optimization settings
- **Xiaomi**: Requires manual auto-start permission in Security settings
- **Huawei**: Known for aggressive background task killing, requires battery optimization exemption
- **OnePlus**: OxygenOS may require additional background process permissions
- **OPPO**: ColorOS has strict background process management

### Web (planned)
- Web Notifications API required
- Cannot guarantee time precision
- No voice synthesis offline

## 🧪 Testing Procedures

1. Schedule test reminders every 30s using test hook
2. Simulate device sleep/wake
3. Turn off internet and verify fallback voice behavior
4. Log output from:
   ```javascript
   Notifications.getAllScheduledNotificationsAsync();
   ```

## 📋 QA Checklist

| Test | iOS | Android | Web |
|------|-----|---------|-----|
| Reminder triggers on schedule | ✅ | ✅ | ⏳ |
| Voice feedback works offline | ✅ | ✅ | 🚫 |
| Duplicates do not occur | ✅ | ✅ | ✅ |
| Emotion-triggered reminders | ✅ | ✅ | ⏳ |
| Background mode reliability | ✅ | ⚠️ | 🚫 |
| Battery optimization impact | 🚫 | ⚠️ | 🚫 |
| Cross-device sync | ✅ | ✅ | ⏳ |

Legend: ✅ = Supported, ⚠️ = Platform-specific issues, 🚫 = Not supported, ⏳ = In development

## 🧠 Best Practices

- Always use persistent notification channels
- Schedule reminders with emotion and priority metadata
- Use haptic + voice fallback for accessibility
- Avoid relying on setTimeout for long-delayed reminders

## 📈 Monitoring & Alerts

- Log reminder creation and triggers to Supabase with triggered_at
- Monitor for >10% untriggered reminders in logs
- Alert on failed TTS playback

## 🧰 Support Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Android Doze Mode](https://developer.android.com/training/monitoring-device-state/doze-standby)
- [iOS BGTaskScheduler](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler) 