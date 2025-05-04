import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

class SentryMonitoringService {
  private static instance: SentryMonitoringService;
  private activeTransactions: Map<string, any> = new Map();

  private constructor() {
    this.initializeSentry();
  }

  public static getInstance(): SentryMonitoringService {
    if (!SentryMonitoringService.instance) {
      SentryMonitoringService.instance = new SentryMonitoringService();
    }
    return SentryMonitoringService.instance;
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
        enableTracing: true,
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
  setUserContext(user: User) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    });
  }

  // Clear user context
  clearUserContext() {
    Sentry.setUser(null);
  }

  // Start a transaction
  startTransaction(name: string, op?: string) {
    const transaction = Sentry.startTransaction({
      name,
      op: op || 'navigation',
    });
    this.activeTransactions.set(name, transaction);
    return transaction;
  }

  // Start a child span
  startSpan(transactionName: string, spanName: string, op: string = 'operation') {
    const transaction = this.activeTransactions.get(transactionName);
    if (!transaction) {
      console.warn(`No active transaction found for ${transactionName}`);
      return null;
    }
    return transaction.startChild({
      op,
      description: spanName,
    });
  }

  // Finish a transaction
  finishTransaction(name: string) {
    const transaction = this.activeTransactions.get(name);
    if (transaction) {
      transaction.finish();
      this.activeTransactions.delete(name);
    }
  }

  // Track app launch performance
  trackAppLaunch() {
    const transaction = this.startTransaction('AppLaunch', 'app.launch');
    
    // Add spans for key initialization steps
    const initSpan = this.startSpan('AppLaunch', 'Initialize App');
    if (initSpan) {
      // Simulate or track actual initialization steps
      setTimeout(() => {
        initSpan.finish();
      }, 100);
    }

    // Finish the transaction after a reasonable timeout
    setTimeout(() => {
      this.finishTransaction('AppLaunch');
    }, 5000);
  }

  // Track screen load performance
  trackScreenLoad(screenName: string) {
    const transaction = this.startTransaction(`${screenName}Load`, 'screen.load');
    
    // Add spans for key loading steps
    const dataSpan = this.startSpan(`${screenName}Load`, 'Load Data');
    if (dataSpan) {
      // Simulate or track actual data loading
      setTimeout(() => {
        dataSpan.finish();
      }, 200);
    }

    // Finish the transaction after a reasonable timeout
    setTimeout(() => {
      this.finishTransaction(`${screenName}Load`);
    }, 3000);
  }

  // Track API call performance
  trackApiCall(endpoint: string) {
    const transaction = this.startTransaction('ApiCall', 'api.call');
    return this.startSpan('ApiCall', endpoint, 'api.request');
  }

  // Track animation performance
  trackAnimation(animationName: string) {
    const transaction = this.startTransaction('Animation', 'animation');
    return this.startSpan('Animation', animationName, 'animation.frame');
  }
}

export const sentryMonitoring = SentryMonitoringService.getInstance(); 