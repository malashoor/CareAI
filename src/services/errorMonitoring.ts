import * as Sentry from '@sentry/react-native';
import { analyticsService } from './analytics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private readonly ERROR_CATEGORIES = {
    NETWORK: 'network_error',
    UI: 'ui_error',
    BUSINESS: 'business_error',
    SYSTEM: 'system_error',
  };

  private constructor() {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      enableNative: true,
      debug: __DEV__,
      tracesSampleRate: 1.0,
      environment: process.env.APP_ENV || 'development',
      beforeSend: (event) => {
        // Add device info to all events
        event.extra = {
          ...event.extra,
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
            deviceType: DeviceInfo.getDeviceType(),
            deviceName: DeviceInfo.getDeviceName(),
            appVersion: DeviceInfo.getVersion(),
            buildNumber: DeviceInfo.getBuildNumber(),
          },
        };
        return event;
      },
    });
  }

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  // Track errors with context
  async trackError(error: Error, context: {
    category: keyof typeof this.ERROR_CATEGORIES;
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      // Add error to Sentry
      Sentry.captureException(error, {
        tags: {
          category: this.ERROR_CATEGORIES[context.category],
          component: context.component,
          action: context.action,
        },
        extra: context.metadata,
      });

      // Track in analytics
      await analyticsService.trackEvent('error_occurred', {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        category: this.ERROR_CATEGORIES[context.category],
        component: context.component,
        action: context.action,
        ...context.metadata,
      });
    } catch (e) {
      console.error('Error tracking failed:', e);
    }
  }

  // Track user actions that might lead to errors
  async trackAction(action: string, metadata?: Record<string, any>) {
    try {
      await analyticsService.trackEvent('user_action', {
        action,
        ...metadata,
      });
    } catch (e) {
      console.error('Action tracking failed:', e);
    }
  }

  // Set user context for better error tracking
  setUserContext(userId: string, userData?: Record<string, any>) {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
  }

  // Clear user context
  clearUserContext() {
    Sentry.setUser(null);
  }

  // Add breadcrumb for better error context
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

export const errorMonitoring = ErrorMonitoringService.getInstance(); 