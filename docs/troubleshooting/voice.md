# Voice Troubleshooting Guide

## Overview

This guide covers common issues, error codes, and solutions for the CareAI voice system. The system handles:
- Text-to-Speech (TTS)
- Voice commands
- Voice feedback
- Audio playback
- Voice recognition

## Common Issues

### 1. Text-to-Speech

#### Error Codes
```
TTS_001: Engine unavailable
TTS_002: Voice not found
TTS_003: Synthesis failed
TTS_004: Audio session error
```

#### Symptoms
- TTS not working
- Wrong voice
- Poor quality
- Audio session issues

#### Diagnostic Steps
```bash
# Check TTS engine
npm run voice:check-tts

# Verify voice availability
npm run voice:verify-voices

# Test synthesis
npm run voice:test-synthesis
```

#### Logs to Check
```bash
# View TTS logs
npm run logs:tts

# Check engine status
npm run logs:engine-status

# Monitor audio sessions
npm run logs:audio-sessions
```

### 2. Voice Commands

#### Error Codes
```
CMD_001: Recognition failed
CMD_002: Command not understood
CMD_003: Permission denied
CMD_004: Microphone error
```

#### Symptoms
- Commands not recognized
- Wrong interpretation
- Permission issues
- Microphone problems

#### Diagnostic Steps
```bash
# Check recognition
npm run voice:check-recognition

# Verify permissions
npm run voice:verify-permissions

# Test microphone
npm run voice:test-microphone
```

#### Logs to Check
```bash
# View command logs
npm run logs:commands

# Check recognition status
npm run logs:recognition-status

# Monitor microphone
npm run logs:microphone-status
```

### 3. Voice Feedback

#### Error Codes
```
FB_001: Playback failed
FB_002: Audio format error
FB_003: Volume control error
FB_004: Background audio error
```

#### Symptoms
- Feedback not playing
- Wrong format
- Volume issues
- Background audio problems

#### Diagnostic Steps
```bash
# Check playback
npm run voice:check-playback

# Verify audio format
npm run voice:verify-format

# Test volume control
npm run voice:test-volume
```

#### Logs to Check
```bash
# View feedback logs
npm run logs:feedback

# Check playback status
npm run logs:playback-status

# Monitor audio format
npm run logs:format-status
```

## Testing Commands

### 1. End-to-End Testing
```bash
# Run voice tests
npm run test:voice

# Test specific scenarios
npm run test:voice -- --grep "tts"
npm run test:voice -- --grep "commands"
npm run test:voice -- --grep "feedback"
```

### 2. Performance Testing
```bash
# Test TTS performance
npm run test:voice-performance

# Check memory usage
npm run test:voice-memory

# Verify response time
npm run test:voice-response
```

### 3. Load Testing
```bash
# Simulate high voice load
npm run test:voice-load

# Test concurrent commands
npm run test:voice-concurrent

# Verify system limits
npm run test:voice-limits
```

## Rollback Procedures

### 1. TTS Rollback
```bash
# Revert TTS changes
npm run voice:rollback-tts

# Restore TTS settings
npm run voice:restore-tts

# Verify TTS system
npm run voice:verify-tts
```

### 2. Command System Rollback
```bash
# Revert command changes
npm run voice:rollback-commands

# Restore command settings
npm run voice:restore-commands

# Verify command system
npm run voice:verify-commands
```

### 3. Feedback System Rollback
```bash
# Revert feedback changes
npm run voice:rollback-feedback

# Restore feedback settings
npm run voice:restore-feedback

# Verify feedback system
npm run voice:verify-feedback
```

## Monitoring & Alerts

### 1. Key Metrics
- TTS success rate
- Command recognition rate
- Feedback delivery rate
- Audio quality
- System performance

### 2. Alert Thresholds
```bash
# Configure voice alerts
npm run voice:configure-alerts

# Set error thresholds
npm run voice:set-thresholds

# Monitor alert status
npm run voice:monitor-alerts
```

### 3. Health Checks
```bash
# Run health check
npm run voice:health-check

# Verify all components
npm run voice:verify-all

# Generate health report
npm run voice:health-report
```

## Platform-Specific Issues

### iOS
1. **TTS Engine Behavior**
```bash
# Check TTS engine
npm run ios:check-tts

# Test voice synthesis
npm run ios:test-synthesis

# Verify voice quality
npm run ios:verify-quality
```

Common Issues:
- AVSpeechSynthesizer limitations
- Voice quality varies by device
- Background audio session conflicts
- System voice restrictions
- Memory pressure on older devices

2. **Voice Recognition**
```bash
# Check recognition
npm run ios:check-recognition

# Test command accuracy
npm run ios:test-commands

# Verify permissions
npm run ios:verify-permissions
```

Common Issues:
- SFSpeechRecognizer requires internet
- Recognition accuracy varies by accent
- Background recognition limitations
- Privacy restrictions
- Battery impact on continuous recognition

3. **Audio Session Management**
```bash
# Check audio session
npm run ios:check-audio

# Test session handling
npm run ios:test-session

# Verify interruptions
npm run ios:verify-interruptions
```

Common Issues:
- Audio session conflicts
- Background audio limitations
- Interruption handling
- Route changes
- Audio quality degradation

### Android
1. **TTS Implementation**
```bash
# Check TTS setup
npm run android:check-tts

# Test voice synthesis
npm run android:test-synthesis

# Verify engine status
npm run android:verify-engine
```

Common Issues:
- TextToSpeech initialization delays
- Voice data download issues
- Engine compatibility problems
- Memory management
- Background playback restrictions

2. **Voice Command Processing**
```bash
# Check command processing
npm run android:check-commands

# Test recognition
npm run android:test-recognition

# Verify wake word
npm run android:verify-wake-word
```

Common Issues:
- Recognition service availability
- Wake word detection reliability
- Background processing limits
- Battery optimization impact
- Manufacturer-specific restrictions

3. **Audio Focus Management**
```bash
# Check audio focus
npm run android:check-focus

# Test focus handling
npm run android:test-focus

# Verify priority
npm run android:verify-priority
```

Common Issues:
- Audio focus conflicts
- Priority handling
- Background playback
- System audio interruptions
- Volume control integration

### Web (Future Support)
1. **Browser TTS Support**
```bash
# Check TTS support
npm run web:check-tts

# Test synthesis
npm run web:test-synthesis

# Verify compatibility
npm run web:verify-compatibility
```

Common Issues:
- Browser TTS API limitations
- Voice quality variations
- Cross-browser compatibility
- Performance impact
- Memory usage

2. **Web Speech API**
```bash
# Check speech API
npm run web:check-speech

# Test recognition
npm run web:test-recognition

# Verify permissions
npm run web:verify-permissions
```

Common Issues:
- API support variations
- Recognition accuracy
- Permission handling
- Network dependency
- Browser-specific limitations

3. **Audio Context**
```bash
# Check audio context
npm run web:check-audio

# Test playback
npm run web:test-playback

# Verify compatibility
npm run web:verify-audio
```

Common Issues:
- Audio context limitations
- Playback restrictions
- Browser autoplay policies
- Performance optimization
- Memory management

## Best Practices

1. **Platform-Specific Optimization**
- Implement platform-specific TTS fallbacks
- Handle voice recognition differences
- Manage audio sessions appropriately
- Optimize for each platform

2. **Performance Considerations**
- Monitor memory usage
- Handle background limitations
- Implement efficient caching
- Manage battery impact

3. **Error Handling**
- Handle platform-specific errors
- Implement graceful fallbacks
- Log platform-specific issues
- Monitor quality metrics

4. **Testing Strategy**
- Test on multiple devices
- Verify different OS versions
- Check browser compatibility
- Validate cross-platform sync

## Support Resources

- [iOS Speech Framework](https://developer.apple.com/documentation/speech)
- [Android TTS Guide](https://developer.android.com/reference/android/speech/tts/TextToSpeech)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Cross-Platform Audio](https://docs.expo.dev/versions/latest/sdk/audio/) 