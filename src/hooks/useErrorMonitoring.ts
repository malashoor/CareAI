import { useCallback } from 'react';
import { errorMonitoring } from '../services/errorMonitoring';

export function useErrorMonitoring(componentName: string) {
  // Track errors with component context
  const trackError = useCallback(
    (error: Error, action?: string, metadata?: Record<string, any>) => {
      errorMonitoring.trackError(error, {
        category: 'UI',
        component: componentName,
        action,
        metadata,
      });
    },
    [componentName]
  );

  // Track user actions
  const trackAction = useCallback(
    (action: string, metadata?: Record<string, any>) => {
      errorMonitoring.trackAction(action, {
        component: componentName,
        ...metadata,
      });
    },
    [componentName]
  );

  // Add breadcrumb
  const addBreadcrumb = useCallback(
    (message: string, category: string, data?: Record<string, any>) => {
      errorMonitoring.addBreadcrumb(message, category, {
        component: componentName,
        ...data,
      });
    },
    [componentName]
  );

  return {
    trackError,
    trackAction,
    addBreadcrumb,
  };
} 