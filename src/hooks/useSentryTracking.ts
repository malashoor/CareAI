import { useCallback } from 'react';
import { sentryConfig } from '../services/sentryConfig';

export function useSentryTracking(componentName: string) {
  // Track navigation
  const trackNavigation = useCallback(
    (screenName: string, params?: Record<string, any>) => {
      sentryConfig.addNavigationBreadcrumb(screenName, params);
    },
    []
  );

  // Track user action
  const trackAction = useCallback(
    (action: string, data?: Record<string, any>) => {
      sentryConfig.addActionBreadcrumb(action, componentName, data);
    },
    [componentName]
  );

  // Track error
  const trackError = useCallback(
    (error: Error, action?: string, data?: Record<string, any>) => {
      sentryConfig.addActionBreadcrumb(
        `Error in ${action || 'unknown action'}`,
        componentName,
        {
          error: error.message,
          stack: error.stack,
          ...data,
        }
      );
    },
    [componentName]
  );

  // Set user context
  const setUserContext = useCallback(
    (userId: string, userData?: Record<string, any>) => {
      sentryConfig.setUserContext(userId, userData);
    },
    []
  );

  // Clear user context
  const clearUserContext = useCallback(() => {
    sentryConfig.clearUserContext();
  }, []);

  return {
    trackNavigation,
    trackAction,
    trackError,
    setUserContext,
    clearUserContext,
  };
} 