# Developer Onboarding

Welcome to the CareAI project! This document will help you get started with development.

## System Requirements

- Node.js >= 16 (Node 18 recommended)
- Yarn or npm
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Modules Overview
- **Virtual Assistant** – conversation engine, personalities, TTS/STT hooks.
- **Health Monitoring** – vital-sign sensors, Supabase persistence, analytics charts.
- **Reminder System** – CRUD screens, notification scheduler, voice playback.
- **SOS / Emergency** – quick-access button, escalation flow, contact list.
- **Admin Dashboard** – usage analytics, emotion trends, gifted-access controls.

### Project Setup Quick-Start
```bash
git clone git@github.com:CleverTech-LLC/careai.git
cd careai
yarn install
expo prebuild
expo start -c
``` 