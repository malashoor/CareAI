import * as Sentry from '@sentry/react-native';
import { performanceMonitoring } from './performanceMonitoring';

interface CriticalPattern {
  category: string;
  count: number;
  severity: 'error' | 'warning' | 'info';
  examples: string[];
  timestamp: number;
}

class SentryBridgeService {
  private static instance: SentryBridgeService;
  private criticalPatterns: CriticalPattern[] = [];
  private readonly CRASH_WINDOW_MS = 60000; // 60 seconds

  private constructor() {
    // Initialize Sentry crash handler
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      enableNative: true,
      debug: __DEV__,
      tracesSampleRate: 1.0,
      environment: process.env.APP_ENV || 'development',
      beforeSend: (event) => {
        // Add critical patterns to the crash report
        const recentPatterns = this.getRecentCriticalPatterns();
        if (recentPatterns.length > 0) {
          event.extra = {
            ...event.extra,
            criticalPatterns: recentPatterns,
          };
        }
        return event;
      },
    });
  }

  static getInstance(): SentryBridgeService {
    if (!SentryBridgeService.instance) {
      SentryBridgeService.instance = new SentryBridgeService();
    }
    return SentryBridgeService.instance;
  }

  addCriticalPattern(pattern: CriticalPattern) {
    this.criticalPatterns.push({
      ...pattern,
      timestamp: Date.now(),
    });

    // Keep only patterns from the last hour
    const oneHourAgo = Date.now() - 3600000;
    this.criticalPatterns = this.criticalPatterns.filter(
      p => p.timestamp > oneHourAgo
    );
  }

  private getRecentCriticalPatterns(): CriticalPattern[] {
    const now = Date.now();
    return this.criticalPatterns
      .filter(p => now - p.timestamp <= this.CRASH_WINDOW_MS)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3); // Only include top 3 most recent patterns
  }

  // Monitor performance metrics for potential issues
  monitorPerformanceMetrics() {
    const metrics = performanceMonitoring.getMetrics();
    const criticalMetrics = metrics.filter(m => 
      m.name.startsWith('log_pattern_') && 
      m.metadata?.severity === 'error'
    );

    criticalMetrics.forEach(metric => {
      this.addCriticalPattern({
        category: metric.name.replace('log_pattern_', ''),
        count: metric.value,
        severity: 'error',
        examples: [metric.metadata?.message || 'No message'],
        timestamp: metric.timestamp,
      });
    });
  }
}

export const sentryBridge = SentryBridgeService.getInstance(); 