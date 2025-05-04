import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { errorMonitoring } from '../services/errorMonitoring';
import * as Sentry from '@sentry/react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track the error
    errorMonitoring.trackError(error, {
      category: 'UI',
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something went wrong. Please try again later.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.setState({ hasError: false, error: null });
            }}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error monitoring
export function withErrorMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return class WithErrorMonitoring extends React.Component<P> {
    componentDidMount() {
      // Add breadcrumb for component mount
      errorMonitoring.addBreadcrumb(
        `${WrappedComponent.name} mounted`,
        'component',
        { props: this.props }
      );
    }

    componentWillUnmount() {
      // Add breadcrumb for component unmount
      errorMonitoring.addBreadcrumb(
        `${WrappedComponent.name} unmounted`,
        'component',
        { props: this.props }
      );
    }

    render() {
      return (
        <ErrorBoundary>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };
}

// Styles for the error fallback UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 