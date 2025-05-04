import { InteractionManager } from 'react-native';
import { analyticsService } from './analytics';
import * as Sentry from '@sentry/react-native';

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private traces: Map<string, { startTime: number; endTime?: number }> = new Map();
  private readonly ALERT_THRESHOLDS = {
    APP_LOAD: 3000, // 3 seconds
    SCREEN_RENDER: 1000, // 1 second
    API_CALL: 5000, // 5 seconds
  };

  private constructor() {}

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  // Start a performance trace
  startTrace(traceName: string): void {
    this.traces.set(traceName, { startTime: Date.now() });
  }

  // End a performance trace
  endTrace(traceName: string): void {
    const trace = this.traces.get(traceName);
    if (trace) {
      trace.endTime = Date.now();
      const duration = trace.endTime - trace.startTime;
      
      // Track in analytics
      analyticsService.trackPerformance(traceName, duration);
      
      // Alert if threshold exceeded
      if (duration > this.ALERT_THRESHOLDS[traceName as keyof typeof this.ALERT_THRESHOLDS]) {
        this.alert(`Performance Alert: ${traceName} took ${duration}ms`, {
          traceName,
          duration,
          threshold: this.ALERT_THRESHOLDS[traceName as keyof typeof this.ALERT_THRESHOLDS],
        });
      }
    }
  }

  // Track screen render time
  trackScreenRender(screenName: string): void {
    const traceName = `screen_render_${screenName}`;
    this.startTrace(traceName);

    InteractionManager.runAfterInteractions(() => {
      const duration = Date.now() - this.traces.get(traceName)!.startTime;
      
      if (duration > this.ALERT_THRESHOLDS.SCREEN_RENDER) {
        this.alert(`Screen Render Slow: ${screenName}`, {
          screenName,
          duration,
          threshold: this.ALERT_THRESHOLDS.SCREEN_RENDER,
        });
      }

      this.endTrace(traceName);
    });
  }

  // Track API call performance
  trackApiCall(endpoint: string): void {
    const traceName = `api_call_${endpoint}`;
    this.startTrace(traceName);
    return () => this.endTrace(traceName);
  }

  // Track app load time
  trackAppLoad(): void {
    const traceName = 'app_load';
    this.startTrace(traceName);

    InteractionManager.runAfterInteractions(() => {
      const duration = Date.now() - this.traces.get(traceName)!.startTime;
      
      if (duration > this.ALERT_THRESHOLDS.APP_LOAD) {
        this.alert('App Load Time Slow', {
          duration,
          threshold: this.ALERT_THRESHOLDS.APP_LOAD,
        });
      }

      this.endTrace(traceName);
    });
  }

  // Alert for performance issues
  private alert(message: string, data: Record<string, any>): void {
    console.warn(`Performance Alert: ${message}`, data);
    Sentry.captureMessage(message, {
      level: 'warning',
      extra: data,
    });
  }
}

export const performanceMonitoring = PerformanceMonitoringService.getInstance(); 