# Chat System Troubleshooting

## 🧩 Overview
The Chat system provides real-time messaging with voice input, emotion detection, and cross-device synchronization. It integrates with Supabase for data persistence and uses platform-specific services for voice processing.

---

## ⚠️ Common Issues

| Issue | Error Code / Behavior | Platform |
|-------|------------------------|----------|
| Voice input fails | `VoiceInputError` / No transcription | All |
| Sync delay | `SyncTimeout` / Messages out of order | All |
| Attachment upload fails | `UploadError` / Media not sent | All |
| Cross-device mismatch | `SessionMismatch` / Messages missing | All |
| Emotion detection fails | `EmotionError` / Incorrect classification | All |

---

## 🎤 Voice Input Issues

### iOS (SiriKit)
- **Common Problems**:
  - SiriKit authorization not granted
  - Background audio session not configured
  - Voice recognition timeout
  - Language model not downloaded

- **Diagnostic Steps**:
  ```bash
  # Check SiriKit authorization
  xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.apple.sirikit"'
  
  # Verify audio session
  xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.apple.avfoundation"'
  ```

- **Quick Fix**:
  ```javascript
  // Reset voice recognition
  await SiriKit.resetVoiceRecognition();
  await AudioSession.configure({
    category: 'playAndRecord',
    mode: 'spokenAudio'
  });
  ```

### Android (STT Services)
- **Common Problems**:
  - Google STT service not available
  - Offline model not installed
  - Permission denied
  - Battery optimization killing service

- **Diagnostic Steps**:
  ```bash
  # Check STT service status
  adb shell dumpsys voiceinteraction
  
  # Verify permissions
  adb shell dumpsys package | grep -A 1 "android.permission.RECORD_AUDIO"
  ```

- **Quick Fix**:
  ```javascript
  // Reset STT service
  await SpeechToText.reset();
  await checkAndRequestPermissions();
  await downloadOfflineModel();
  ```

## 🔄 Sync Issues

### Supabase Latency
- **Symptoms**:
  - Messages appear out of order
  - Delayed delivery status
  - Duplicate messages
  - Missing messages

- **Diagnostic Steps**:
  ```javascript
  // Check sync status
  const syncStatus = await supabase
    .from('chat_messages')
    .select('sync_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  ```

- **Quick Fix**:
  ```javascript
  // Force sync
  async function forceSync() {
    await clearLocalCache();
    await syncFromSupabase();
    await verifyMessageOrder();
  }
  ```

### Offline Chat
- **Symptoms**:
  - Messages stuck in "sending"
  - Failed to reconnect
  - Lost messages after reconnect

- **Quick Fix**:
  ```javascript
  // Handle offline state
  async function handleOffline() {
    await enableOfflineMode();
    await queuePendingMessages();
    await setupReconnectionHandler();
  }
  ```

## 📎 Attachment Handling

### Supported Formats
| Type | iOS | Android | Web |
|------|-----|---------|-----|
| Images | ✅ | ✅ | ✅ |
| Videos | ✅ | ✅ | ⏳ |
| Audio | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ |

### Common Upload Errors
- **Error Codes**:
  - `FILE_TOO_LARGE`: Exceeds 100MB limit
  - `INVALID_FORMAT`: Unsupported file type
  - `UPLOAD_TIMEOUT`: Network issues
  - `STORAGE_QUOTA`: Exceeds user quota

- **Quick Fix**:
  ```javascript
  // Handle upload failure
  async function retryUpload(file) {
    const compressed = await compressFile(file);
    const chunked = await splitIntoChunks(compressed);
    await uploadWithRetry(chunked);
  }
  ```

## 🌍 Cross-Device Consistency

### Session Management
- **Common Issues**:
  - Messages missing on new device
  - Read status not syncing
  - Typing indicators stuck
  - Presence status incorrect

- **Diagnostic Steps**:
  ```javascript
  // Check session state
  const sessionState = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', currentUser.id);
  ```

- **Quick Fix**:
  ```javascript
  // Reset session
  async function resetSession() {
    await clearSessionData();
    await syncUserPreferences();
    await reinitializePresence();
  }
  ```

### Message Continuity
- **Symptoms**:
  - Messages out of order
  - Missing context
  - Duplicate messages
  - Inconsistent read status

- **Quick Fix**:
  ```javascript
  // Ensure message continuity
  async function ensureContinuity() {
    await verifyMessageChain();
    await syncReadStatus();
    await updateTypingState();
  }
  ```

## 🧠 Emotion Detection

### Classification Issues
- **Common Problems**:
  - Incorrect emotion labels
  - Missing context
  - Language mismatch
  - Low confidence scores

- **Diagnostic Steps**:
  ```javascript
  // Check emotion detection
  const emotionMetrics = await supabase
    .from('emotion_logs')
    .select('confidence, classification, context')
    .order('created_at', { ascending: false })
    .limit(10);
  ```

- **Quick Fix**:
  ```javascript
  // Reset emotion detection
  async function resetEmotionDetection() {
    await clearEmotionCache();
    await reloadLanguageModel();
    await verifyContextWindow();
  }
  ```

### Trend Detection
- **Symptoms**:
  - Missed emotional patterns
  - False positives
  - Delayed trend alerts
  - Inconsistent baselines

- **Quick Fix**:
  ```javascript
  // Recalibrate trends
  async function recalibrateTrends() {
    await clearTrendData();
    await rebuildBaseline();
    await verifyAlertThresholds();
  }
  ```

## 📋 QA Checklist

| Test | iOS | Android | Web |
|------|-----|---------|-----|
| Voice input accuracy | ✅ | ✅ | 🚫 |
| Offline message sync | ✅ | ✅ | ⏳ |
| Attachment handling | ✅ | ✅ | ⏳ |
| Cross-device sync | ✅ | ✅ | ⏳ |
| Emotion detection | ✅ | ✅ | ⏳ |
| Trend analysis | ✅ | ✅ | 🚫 |

Legend: ✅ = Supported, ⚠️ = Platform-specific issues, 🚫 = Not supported, ⏳ = In development

## 🧰 Support Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [iOS SiriKit Documentation](https://developer.apple.com/documentation/sirikit)
- [Android Speech Recognition](https://developer.android.com/reference/android/speech/package-summary)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🔍 Live Debug Sessions

### Voice & Emotion Flow
```bash
# Start debug session
LOG_LEVEL=debug expo start

# Monitor voice processing
tail -f logs/voice.log | grep 'Emotion'

# Watch Supabase realtime
tail -f logs/supabase.log | grep 'realtime'

# Check emotion sync
tail -f logs/emotion.log | grep 'sync'
```

### Log Interpretation Guide
| Log Pattern | Meaning | Action |
|-------------|---------|--------|
| `VoiceInputError: SiriKit` | iOS voice service issue | Check SiriKit permissions |
| `EmotionSyncTimeout` | Emotion data sync delay | Verify network connection |
| `SupabaseRealtimeError` | Real-time connection lost | Check Supabase status |

### Common Debug Scenarios
```bash
# Scenario 1: Voice Input Chain
LOG_LEVEL=debug expo start --ios
tail -f logs/voice.log | grep -E 'input|processing|emotion'

# Scenario 2: Sync Issues
LOG_LEVEL=debug expo start --android
tail -f logs/sync.log | grep -E 'supabase|realtime|offline'

# Scenario 3: Emotion Detection
LOG_LEVEL=debug expo start
tail -f logs/emotion.log | grep -E 'detection|classification|trend'
```

## 🎯 Regression Watchlist

### High-Risk Areas
1. **Voice Processing Chain**
   - Voice input → STT → Emotion detection → TTS
   - Test after: Voice SDK updates, Emotion model changes
   - Related tests: `tests/chat/voiceInput.test.tsx`

2. **Sync Pipeline**
   - Local cache → Supabase → Cross-device sync
   - Test after: Supabase updates, Network changes
   - Related tests: `tests/chat/sync.test.tsx`

3. **Emotion Analysis**
   - Text analysis → Emotion detection → Trend analysis
   - Test after: NLP model updates, Context changes
   - Related tests: `tests/chat/emotionSync.test.tsx`

4. **Attachment Flow**
   - Upload → Compression → Storage → Download
   - Test after: Storage changes, Network updates
   - Related tests: `tests/chat/attachments.test.tsx`

### Test Coverage Matrix
| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| Voice Input | ✅ | ✅ | ✅ |
| Emotion Sync | ✅ | ✅ | ⏳ |
| Attachment | ✅ | ✅ | ✅ |
| Cross-Device | ✅ | ⏳ | 🚫 |

## 📚 Test References

### Unit Tests
- Voice Input: `tests/chat/voiceInput.test.tsx`
- Emotion Detection: `tests/chat/emotionDetection.test.tsx`
- Attachment Handling: `tests/chat/attachments.test.tsx`
- Session Management: `tests/chat/sessions.test.tsx`

### Integration Tests
- Voice → Emotion: `tests/chat/voiceEmotion.test.tsx`
- Sync Pipeline: `tests/chat/sync.test.tsx`
- Cross-Device: `tests/chat/crossDevice.test.tsx`
- Offline Mode: `tests/chat/offline.test.tsx`

### E2E Tests
- Complete Flow: `tests/e2e/chatFlow.test.tsx`
- Voice Chain: `tests/e2e/voiceChain.test.tsx`
- Sync Chain: `tests/e2e/syncChain.test.tsx` 