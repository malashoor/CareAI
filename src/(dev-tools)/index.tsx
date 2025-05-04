import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { LogPatternMonitor } from '../components/LogPatternMonitor';
import { ToastManager } from '../components/ToastManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function DevToolsIndex() {
  const router = useRouter();
  const [isLogMonitorExpanded, setIsLogMonitorExpanded] = useState(__DEV__);
  const [isLogMonitorEnabled, setIsLogMonitorEnabled] = useState(__DEV__);
  const toastManagerRef = useRef<{ showToast: (message: string, severity: 'error' | 'warning' | 'info') => void }>(null);

  useEffect(() => {
    // Load log monitor state from storage
    AsyncStorage.getItem('logMonitorEnabled').then(value => {
      if (value !== null) {
        setIsLogMonitorEnabled(value === 'true');
      }
    });
  }, []);

  const toggleLogMonitor = async () => {
    const newValue = !isLogMonitorEnabled;
    setIsLogMonitorEnabled(newValue);
    await AsyncStorage.setItem('logMonitorEnabled', newValue.toString());
  };

  const handleCriticalPatterns = (patterns: any[]) => {
    patterns.forEach(pattern => {
      const message = `${pattern.category}: ${pattern.examples[0] || 'Pattern detected'}`;
      toastManagerRef.current?.showToast(message, pattern.severity as 'error' | 'warning' | 'info');
    });
  };

  const devTools = [
    {
      title: 'OCR Test',
      description: 'Test the Google Cloud Vision OCR integration',
      route: '/ocr-test',
    },
    // Add more dev tools here as needed
  ];

  return (
    <View style={styles.container}>
      <ToastManager ref={toastManagerRef} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Development Tools</Text>
          
          {/* Log Pattern Monitor Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsLogMonitorExpanded(!isLogMonitorExpanded)}
            >
              <View style={styles.sectionHeaderLeft}>
                <Ionicons 
                  name={isLogMonitorExpanded ? 'chevron-down' : 'chevron-forward'} 
                  size={24} 
                  color={theme.colors.dark}
                />
                <Text style={styles.sectionTitle}>Log Pattern Monitor</Text>
              </View>
              <Switch
                value={isLogMonitorEnabled}
                onValueChange={toggleLogMonitor}
                trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>
            
            {isLogMonitorExpanded && isLogMonitorEnabled && (
              <View style={styles.logMonitorContainer}>
                <LogPatternMonitor 
                  onCriticalPatterns={handleCriticalPatterns}
                />
              </View>
            )}
          </View>

          {/* Other Dev Tools */}
          {devTools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={styles.toolCard}
              onPress={() => router.push(tool.route)}
            >
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.dark,
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.dark,
    marginLeft: theme.spacing.sm,
  },
  logMonitorContainer: {
    padding: theme.spacing.md,
  },
  toolCard: {
    backgroundColor: theme.colors.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  toolTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  toolDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.gray[600],
  },
}); 