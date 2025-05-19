---
title: "Android audio latency"
labels: handover-blocker
assignees: ""
---

## Description
Describe irregular 300-500 ms delay on voice playback. Affects Samsung A-series.
Located in useVoiceRecording hook.

## Steps to Reproduce
1. Use a Samsung A-series device (A51, A52, etc.)
2. Navigate to any screen with voice recording/playback
3. Record a voice message and play it back
4. Observe the delayed playback

## Expected behavior
Voice playback should begin immediately without delay

## Current behavior
There is an irregular 300-500 ms delay before playback starts

## Environment
- Platform: Android
- Device model: Samsung A-series
- React Native version: [version]
- Expo version: [version]

## Additional context
The issue is likely in the useVoiceRecording hook. Preliminary investigation suggests it may be related to buffer sizes or audio preprocessing specific to Samsung devices. 