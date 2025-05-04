import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

class SentryConfigService {
  private static instance: SentryConfigService;

  private constructor() {
    this.initializeSentry();
  }

  public static getInstance(): SentryConfigService {
    if (!SentryConfigService.instance) {
      SentryConfigService.instance = new SentryConfigService();
    }
    return SentryConfigService.instance;
  }

  private async initializeSentry() {
    try {
      // Get device info
      const deviceInfo = await this.getDeviceInfo();

      // Initialize Sentry
      Sentry.init({
        dsn: process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN',
        enableNative: true,
        debug: __DEV__,
        tracesSampleRate: 1.0,
        environment: process.env.APP_ENV || 'development',
        beforeSend: (event) => {
          // Add device info to all events
          event.extra = {
            ...event.extra,
            deviceInfo,
          };
          return event;
        },
      });

      // Set default tags
      Sentry.setTag('app_version', Constants.expoConfig?.version || 'unknown');
      Sentry.setTag('build_channel', process.env.APP_ENV || 'development');
      Sentry.setTag('platform', Platform.OS);
      Sentry.setTag('device_type', deviceInfo.deviceType);

      // Set default context
      Sentry.setContext('device', {
        ...deviceInfo,
        appVersion: Constants.expoConfig?.version,
        buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode,
      });

    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  private async getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      deviceType: await Device.getDeviceTypeAsync(),
      deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      modelName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      osVersion: Platform.Version,
      totalMemory: await Device.getMaxMemoryAsync(),
      isDevice: true,
    };
  }

  // Set user context
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

  // Add navigation breadcrumb
  addNavigationBreadcrumb(screenName: string, params?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${screenName}`,
      level: 'info',
      data: params,
    });
  }

  // Add action breadcrumb
  addActionBreadcrumb(action: string, component: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'action',
      message: `${component}: ${action}`,
      level: 'info',
      data,
    });
  }

  // Test error reporting
  testErrorReporting() {
    try {
      throw new Error('Test error from SentryConfigService');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: 'true',
          source: 'SentryConfigService',
        },
        extra: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

export const sentryConfig = SentryConfigService.getInstance(); 