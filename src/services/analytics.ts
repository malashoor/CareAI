import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {
    // Initialize analytics
    if (Platform.OS !== 'web') {
      analytics().setAnalyticsCollectionEnabled(true);
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track screen views
  async trackScreen(screenName: string, screenClass: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Track user actions
  async trackEvent(eventName: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Track user properties
  async setUserProperties(properties: Record<string, any>) {
    try {
      Object.entries(properties).forEach(async ([key, value]) => {
        await analytics().setUserProperty(key, value);
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Track performance metrics
  async trackPerformance(metricName: string, value: number) {
    try {
      await analytics().logEvent('performance_metric', {
        metric_name: metricName,
        value: value,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
}

export const analyticsService = AnalyticsService.getInstance(); 