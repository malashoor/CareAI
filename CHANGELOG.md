# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2023-07-15

### Added
- Senior Dashboard with KPI cards, haptic SOS button, and emotion greeting
- `KpiCard` component for displaying health metrics in a senior-friendly format
- `timeOfDay()` utility function for contextual greeting messages
- Emotion-to-icon mapping for visual emotion representation
- SOS button with haptic feedback for emergency situations
- Dark mode support for dashboard and all new components
- Comprehensive accessibility improvements for screen readers

### Fixed
- Improved contrast ratios in both light and dark themes
- Fixed font scaling issues for users with larger text preferences

### Security
- None

### Notes
- Android 13+ users need to grant vibration permission for SOS haptic feedback to work correctly 