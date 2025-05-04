import { performanceMonitoring } from './performanceMonitoring';

interface LogPattern {
  pattern: RegExp;
  category: string;
  severity: 'warning' | 'error' | 'info';
  description: string;
}

class LogPatternMonitoringService {
  private static instance: LogPatternMonitoringService;
  private patterns: LogPattern[] = [];
  private isMonitoring: boolean = false;

  private constructor() {
    this.initializePatterns();
  }

  static getInstance(): LogPatternMonitoringService {
    if (!LogPatternMonitoringService.instance) {
      LogPatternMonitoringService.instance = new LogPatternMonitoringService();
    }
    return LogPatternMonitoringService.instance;
  }

  private initializePatterns() {
    // Metro/JS Engine Patterns
    this.patterns.push(
      {
        pattern: /bundle\.js \[size\] exceeds recommended/,
        category: 'Bundle Size',
        severity: 'warning',
        description: 'Bundle size exceeds recommended limit'
      },
      {
        pattern: /Require cycle: components\//,
        category: 'Require Cycle',
        severity: 'warning',
        description: 'Circular dependency detected in components'
      },
      {
        pattern: /JS Runtime memory/,
        category: 'Memory',
        severity: 'warning',
        description: 'JS runtime memory pressure detected'
      },
      {
        pattern: /Bridge queue length exceeded/,
        category: 'Bridge',
        severity: 'warning',
        description: 'Bridge queue length exceeded threshold'
      }
    );

    // Native Layer Patterns
    this.patterns.push(
      {
        pattern: /received memory warning/,
        category: 'Native Memory',
        severity: 'warning',
        description: 'Native memory pressure detected'
      },
      {
        pattern: /skipped frames detected/,
        category: 'Frame Drops',
        severity: 'warning',
        description: 'Frame drops detected in animation/rendering'
      },
      {
        pattern: /native_modules_bridge/,
        category: 'Bridge Traffic',
        severity: 'info',
        description: 'High-frequency native module calls detected'
      },
      {
        pattern: /resource_limit_reached/,
        category: 'Resources',
        severity: 'error',
        description: 'Resource limit reached (threads/files/connections)'
      }
    );

    // React Performance Patterns
    this.patterns.push(
      {
        pattern: /Slow render detected/,
        category: 'Render Performance',
        severity: 'warning',
        description: 'Slow component render detected'
      },
      {
        pattern: /Effect cleanup timeout/,
        category: 'Effect Cleanup',
        severity: 'warning',
        description: 'Effect cleanup taking too long'
      },
      {
        pattern: /Batch state update/,
        category: 'State Updates',
        severity: 'info',
        description: 'Batch state update detected'
      },
      {
        pattern: /Screen transition/,
        category: 'Navigation',
        severity: 'info',
        description: 'Screen transition timing'
      }
    );
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Override console methods to intercept logs
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    console.log = (...args) => {
      this.processLog('info', args);
      originalConsole.log.apply(console, args);
    };

    console.warn = (...args) => {
      this.processLog('warning', args);
      originalConsole.warn.apply(console, args);
    };

    console.error = (...args) => {
      this.processLog('error', args);
      originalConsole.error.apply(console, args);
    };
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    // Restore original console methods
    console.log = console.log;
    console.warn = console.warn;
    console.error = console.error;
  }

  private processLog(level: 'info' | 'warning' | 'error', args: any[]) {
    const logMessage = args.join(' ');

    for (const pattern of this.patterns) {
      if (pattern.pattern.test(logMessage)) {
        // Record the pattern match as a performance metric
        performanceMonitoring.addMetric(
          `log_pattern_${pattern.category.toLowerCase()}`,
          1,
          {
            pattern: pattern.pattern.toString(),
            message: logMessage,
            severity: pattern.severity,
            description: pattern.description
          }
        );

        // If it's a warning or error, also trigger an alert
        if (pattern.severity === 'warning' || pattern.severity === 'error') {
          performanceMonitoring.alert(
            `Log Pattern Alert: ${pattern.description}`,
            {
              category: pattern.category,
              severity: pattern.severity,
              message: logMessage
            }
          );
        }
      }
    }
  }

  getPatterns(): LogPattern[] {
    return this.patterns;
  }

  addPattern(pattern: LogPattern) {
    this.patterns.push(pattern);
  }
}

export const logPatternMonitoring = LogPatternMonitoringService.getInstance(); 