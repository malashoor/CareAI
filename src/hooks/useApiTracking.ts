import { useCallback } from 'react';
import { sentryMonitoring } from '../services/sentryMonitoring';

export const useApiTracking = () => {
  const trackApiCall = useCallback(async <T>(
    label: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const span = sentryMonitoring.startSpan(label, 'api_call');
    
    try {
      const result = await apiCall();
      
      if (span) {
        span.setData(metadata || {});
        span.finish();
      }
      
      return result;
    } catch (error) {
      if (span) {
        span.setData({
          ...metadata,
          error: error.message,
        });
        span.finish();
      }
      throw error;
    }
  }, []);

  // Track animation performance
  const trackAnimation = useCallback(
    (animationName: string, animation: () => void) => {
      const span = sentryMonitoring.trackAnimation(animationName);
      
      try {
        animation();
        if (span) span.finish();
      } catch (error) {
        if (span) span.finish();
        throw error;
      }
    },
    []
  );

  return {
    trackApiCall,
    trackAnimation,
  };
}; 