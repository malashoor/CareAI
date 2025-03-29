import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AIService } from '../services/ai';

export function APITest() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    usage?: { total_tokens: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    try {
      const result = await AIService.getInstance().testAPIConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isLoading ? 'Testing...' : 'Test OpenAI API'}
        onPress={testAPI}
        disabled={isLoading}
      />
      {testResult && (
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultText,
            { color: testResult.success ? 'green' : 'red' }
          ]}>
            {testResult.message}
          </Text>
          {testResult.usage && (
            <Text style={styles.usageText}>
              Tokens used: {testResult.usage.total_tokens}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  usageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 