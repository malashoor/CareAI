import React, { useEffect } from 'react';
import { sentryMonitoring } from '../services/sentryMonitoring';

export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transactionName: string
) => {
  return function WithPerformanceTracking(props: P) {
    useEffect(() => {
      // Start transaction when component mounts
      const transaction = sentryMonitoring.startTransaction(transactionName);

      // Finish transaction when component unmounts
      return () => {
        if (transaction) {
          transaction.finish();
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}; 