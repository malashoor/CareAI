import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  formName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Form error in ${this.props.formName}:`, error);
    console.error('Error info:', errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Form Error</Text>
          <Text style={styles.message}>
            There was an error processing the {this.props.formName} form.
            {this.state.error?.message ? `\n${this.state.error.message}` : ''}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Reset Form</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.background,
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    textAlign: 'center',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  message: {
    color: theme.colors.text,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    marginTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },
}); 