# CareAI Log Pattern Monitoring

## Overview

The Log Pattern Monitoring system is a comprehensive observability platform that provides real-time insights into application performance, error patterns, and system health. It's designed to help developers and QA teams quickly identify and respond to issues during development and testing.

## Features

### Core Monitoring
- Real-time pattern detection across Metro/JS, Native, and React layers
- Severity-based categorization (Error, Warning, Info)
- Pattern hit counting and trend analysis
- Collapsible UI with auto-refresh

### Session Analytics
- Detailed session summaries with pattern statistics
- Duration tracking and timing information
- Top pattern identification
- Screenshot and data export capabilities

### Crash Correlation
- Sentry integration for crash reporting
- 60-second pattern window for crash context
- Top 3 critical patterns auto-attached to crash reports
- Pattern retention with 1-hour lifecycle

### Developer Tools
- Environment-aware monitoring (dev/staging only)
- Build-time validation checks
- Export functionality for QA reports
- Toast notifications for critical patterns

## Usage

### Development
```typescript
// Access the monitor in Dev Tools
import { LogPatternMonitor } from '../components/LogPatternMonitor';

// In your dev tools screen:
<LogPatternMonitor 
  onCriticalPatterns={(patterns) => {
    // Handle critical patterns
    console.log('Critical patterns detected:', patterns);
  }}
/>
```

### Configuration
The monitor is automatically configured based on the environment:
- Development: Full monitoring enabled
- Staging: Monitoring enabled with limited features
- Production: Monitoring disabled

### Build Checks
The system includes build-time validation to ensure proper setup:
```typescript
import { validateLogPatternSetup } from '../utils/buildChecks';

// Run checks
const result = await validateLogPatternSetup();
if (!result.success) {
  console.error('Setup validation failed:', result.errors);
}
```

## Pattern Categories

### Metro/JS Engine
- Bundle size warnings
- Require cycle detection
- JS memory warnings
- Bridge queue load

### Native Layer
- Memory pressure
- Frame drop detection
- Bridge traffic volume
- Resource warnings

### React Performance
- Slow render detection
- Effect cleanup lag
- Batch state update monitoring
- Navigation transition traces

## Best Practices

1. **Development**
   - Keep the monitor open during active development
   - Use severity filters to focus on specific issues
   - Export session summaries for team sharing

2. **Testing**
   - Monitor pattern trends during QA cycles
   - Use session summaries for test reports
   - Watch for critical patterns in crash reports

3. **Production**
   - Monitor is automatically disabled
   - Critical patterns are still tracked for crash correlation
   - Pattern data is retained for 1 hour

## Future Enhancements

Planned features for future releases:
- Pattern trend heatmap visualization
- Log history timeline view
- Slack/Discord integration for dev alerts
- Enhanced export formats

## Contributing

When adding new patterns or features:
1. Add pattern definitions in `logPatternMonitoring.ts`
2. Update build checks if needed
3. Add tests in `logPatternMonitoring.test.ts`
4. Update documentation

## Support

For issues or feature requests:
1. Check the build validation output
2. Review Sentry crash reports for pattern context
3. Export session data for debugging
4. Contact the development team 

## 📚 Developer Resources
- [🧭 Architecture Overview](docs/ARCHITECTURE.md)
- [✅ Release Notes](docs/RELEASE_NOTES.md)
- [📌 Contribution Guide](CONTRIBUTING.md)
- [🔍 QA Tracking](project/docs/QA_TRACKING.md)
- [⚙️ Configuration Guide](docs/CONFIGURATION.md)
- [🔧 Development Setup](docs/DEVELOPMENT.md) 