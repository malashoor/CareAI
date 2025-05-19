---
title: "RTL bubble mis-alignment"
labels: handover-blocker
assignees: ""
---

## Description
ChatScreen showing 8 px offset on right-to-left languages.
Likely in MessageBubble styles.

## Steps to Reproduce
1. Change the device language to Arabic, Hebrew, or any RTL language
2. Navigate to the ChatScreen
3. Observe the message bubbles alignment

## Expected behavior
Message bubbles should be properly aligned regardless of text direction

## Current behavior
There is an 8 px offset on right-to-left languages, causing visual misalignment

## Environment
- Platform: iOS and Android
- Language setting: Any RTL language (Arabic, Hebrew, etc.)
- React Native version: [version]
- Expo version: [version]

## Additional context
The issue is likely in the MessageBubble component styles. Initial investigation suggests the RTL support might not be properly implemented in the chat bubble layout calculations. 