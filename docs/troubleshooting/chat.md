# Chat Troubleshooting Guide

## Overview

This guide covers common issues, error codes, and solutions for the CareAI chat system. The system handles:
- Real-time messaging
- Voice messages
- File attachments
- Message encryption
- Chat history sync

## Common Issues

### 1. Real-time Messaging

#### Error Codes
```
CHAT_001: Connection lost
CHAT_002: Message delivery failed
CHAT_003: Sync conflict
CHAT_004: Rate limit exceeded
```

#### Symptoms
- Messages not sending
- Delayed message delivery
- Duplicate messages
- Missing messages

#### Diagnostic Steps
```bash
# Check real-time connection
npm run chat:check-connection

# Test message delivery
npm run chat:test-delivery

# Verify message sync
npm run chat:verify-sync
```

#### Logs to Check
```bash
# View chat logs
npm run logs:chat

# Check message status
npm run logs:message-status

# Monitor sync status
npm run logs:sync-status
```

### 2. Voice Messages

#### Error Codes
```
VOICE_001: Recording failed
VOICE_002: Playback error
VOICE_003: File corruption
VOICE_004: Storage limit exceeded
```

#### Symptoms
- Voice messages not recording
- Playback issues
- Corrupted files
- Storage errors

#### Diagnostic Steps
```bash
# Check recording permissions
npm run chat:check-recording

# Test voice playback
npm run chat:test-playback

# Verify file integrity
npm run chat:verify-files
```

#### Logs to Check
```bash
# View voice message logs
npm run logs:voice-messages

# Check recording status
npm run logs:recording-status

# Monitor storage usage
npm run logs:storage-usage
```

### 3. File Attachments

#### Error Codes
```
FILE_001: Upload failed
FILE_002: Download error
FILE_003: Invalid format
FILE_004: Size limit exceeded
```

#### Symptoms
- Files not uploading
- Download failures
- Format errors
- Size limit errors

#### Diagnostic Steps
```bash
# Check upload permissions
npm run chat:check-upload

# Test file download
npm run chat:test-download

# Verify file formats
npm run chat:verify-formats
```

#### Logs to Check
```bash
# View file transfer logs
npm run logs:file-transfer

# Check upload status
npm run logs:upload-status

# Monitor download progress
npm run logs:download-progress
```

## Testing Commands

### 1. End-to-End Testing
```bash
# Run chat tests
npm run test:chat

# Test specific scenarios
npm run test:chat -- --grep "messaging"
npm run test:chat -- --grep "voice"
npm run test:chat -- --grep "files"
```

### 2. Performance Testing
```bash
# Test message delivery speed
npm run test:chat-performance

# Check memory usage
npm run test:chat-memory

# Verify real-time sync
npm run test:chat-realtime
```

### 3. Load Testing
```bash
# Simulate high message volume
npm run test:chat-load

# Test concurrent users
npm run test:chat-concurrent

# Verify rate limiting
npm run test:chat-rate-limit
```

## Rollback Procedures

### 1. Message Sync Rollback
```bash
# Revert to previous sync state
npm run chat:rollback-sync

# Restore message history
npm run chat:restore-history

# Verify message integrity
npm run chat:verify-messages
```

### 2. Voice Message Rollback
```bash
# Revert voice message changes
npm run chat:rollback-voice

# Restore voice settings
npm run chat:restore-voice

# Verify voice functionality
npm run chat:verify-voice
```

### 3. File System Rollback
```bash
# Revert file system changes
npm run chat:rollback-files

# Restore file permissions
npm run chat:restore-permissions

# Verify file access
npm run chat:verify-files
```

## Monitoring & Alerts

### 1. Key Metrics
- Message delivery rate
- Voice message success rate
- File transfer success rate
- Sync conflict rate
- Storage usage

### 2. Alert Thresholds
```bash
# Configure chat alerts
npm run chat:configure-alerts

# Set error thresholds
npm run chat:set-thresholds

# Monitor alert status
npm run chat:monitor-alerts
```

### 3. Health Checks
```bash
# Run health check
npm run chat:health-check

# Verify all components
npm run chat:verify-all

# Generate health report
npm run chat:health-report
```

## Platform-Specific Issues

### iOS
1. **Background Mode Issues**
```bash
# Check background modes
npm run ios:check-background

# Verify capabilities
npm run ios:verify-capabilities

# Test background messaging
npm run ios:test-background
```

2. **Voice Message Issues**
```bash
# Check voice permissions
npm run ios:check-voice

# Test voice recording
npm run ios:test-recording

# Verify playback
npm run ios:verify-playback
```

### Android
1. **Storage Issues**
```bash
# Check storage permissions
npm run android:check-storage

# Test file access
npm run android:test-files

# Verify storage quota
npm run android:verify-storage
```

2. **Battery Impact**
```bash
# Check battery usage
npm run android:check-battery

# Test background impact
npm run android:test-background

# Verify wake locks
npm run android:verify-wake-locks
```

## Best Practices

1. **Message Handling**
- Implement message queuing
- Handle offline messages
- Manage message conflicts

2. **File Management**
- Implement size limits
- Validate file types
- Handle storage quotas

3. **Performance**
- Optimize message sync
- Manage memory usage
- Handle large files

4. **Security**
- Encrypt messages
- Secure file transfers
- Manage permissions

## Support Resources

- [Real-time Chat Documentation](https://supabase.io/docs/guides/realtime)
- [Voice Message Guide](https://docs.expo.dev/versions/latest/sdk/audio/)
- [File System Guide](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Security Best Practices](https://docs.expo.dev/versions/latest/security/) 