# CareAI Developer Documentation

## Overview

CareAI is a React Native application designed to provide comprehensive care management and emotional support for seniors. This documentation covers the technical architecture, components, and development guidelines.

## Table of Contents

### Core Documentation
- [Architecture Overview](./architecture/README.md)
- [Component Library](./components/README.md)
- [API Reference](./api/README.md)
- [Testing Guidelines](./testing/README.md)

### Component Categories

#### Screen Components
- [RemindersListScreen](./components/README.md#reminderslistscreen)
- [ChatScreen](./components/README.md#chatscreen)
- [DashboardScreen](./components/README.md#dashboardscreen)

#### Utility Components
- [MessageInput](./components/README.md#messageinput)
- [AccessibleContainer](./components/README.md#accessiblecontainer)
- [HealthSyncSettings](./components/README.md#healthsyncsettings)
- [SOSButton](./components/README.md#sosbutton)
- [EmotionIndicator](./components/README.md#emotionindicator)
- [AccessibleButton](./components/README.md#accessiblebutton)
- [OfflineStatusBanner](./components/README.md#offlinestatusbanner)
- [TransitionHistory](./components/README.md#transitionhistory)
- [PersonalityAnalytics](./components/README.md#personalityanalytics)

### Development Guidelines

#### Accessibility
- [Accessibility Checklist](./accessibility/README.md)
- [Voice Testing Procedures](./accessibility/voice-testing.md)
- [Screen Reader Support](./accessibility/screen-reader.md)

#### Performance
- [Performance Optimization](./performance/README.md)
- [Offline Support](./performance/offline.md)
- [Data Caching](./performance/caching.md)

#### Testing
- [Unit Testing](./testing/unit.md)
- [Integration Testing](./testing/integration.md)
- [E2E Testing](./testing/e2e.md)

## Getting Started

### Prerequisites
- Node.js 18+
- Yarn
- Xcode (iOS development)
- Android Studio (Android development)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/careai.git

# Install dependencies
yarn install

# Start the development server
yarn start
```

### Development Workflow
1. Create a feature branch from `main`
2. Implement changes following our [coding standards](./standards/README.md)
3. Write tests for new features
4. Submit a pull request for review

## Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────┐
│                     CareAI App                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  UI Layer   │  │  State      │  │  Services       │  │
│  │  Components │◄─┤  Management │◄─┤  & APIs         │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│         ▲               ▲               ▲               │
│         │               │               │               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Hooks      │  │  Context    │  │  Supabase       │  │
│  │  & Utils    │  │  Providers  │  │  Integration    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Technologies
- React Native
- TypeScript
- Supabase
- React Query
- React Navigation
- Expo

## Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details. 