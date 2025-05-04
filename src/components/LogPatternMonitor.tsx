import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { analyzeLogPatterns, getLogPatternSummary, getCriticalLogPatterns } from '../utils/logAnalysis';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { SessionSummary } from './SessionSummary';
import { sentryBridge } from '../services/SentryBridge';
import { remoteConfig } from '../services/RemoteConfig';

interface LogPatternMonitorProps {
  onCriticalPatterns?: (patterns: any[]) => void;
}

type SeverityFilter = 'all' | 'error' | 'warning' | 'info';

export function LogPatternMonitor({ onCriticalPatterns }: LogPatternMonitorProps) {
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [criticalPatterns, setCriticalPatterns] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [patternCounts, setPatternCounts] = useState<Record<string, number>>({});
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const sessionStartTime = useRef(Date.now());
  const [isRemoteEnabled, setIsRemoteEnabled] = useState(false);

  useEffect(() => {
    const initializeRemoteConfig = async () => {
      await remoteConfig.initialize();
      setIsRemoteEnabled(remoteConfig.isFeatureEnabled('realTimeMonitoring'));
    };

    initializeRemoteConfig();
  }, []);

  useEffect(() => {
    const updateAnalysis = () => {
      const newAnalysis = analyzeLogPatterns();
      const newSummary = getLogPatternSummary();
      const newCriticalPatterns = getCriticalLogPatterns();

      // Update pattern counts
      const counts: Record<string, number> = {};
      newAnalysis.forEach(pattern => {
        counts[pattern.category] = (counts[pattern.category] || 0) + pattern.count;
      });
      setPatternCounts(counts);

      setAnalysis(newAnalysis);
      setSummary(newSummary);
      setCriticalPatterns(newCriticalPatterns);

      // Update Sentry with critical patterns
      newCriticalPatterns.forEach(pattern => {
        sentryBridge.addCriticalPattern({
          category: pattern.category,
          count: pattern.count,
          severity: pattern.severity,
          examples: pattern.examples,
          timestamp: Date.now(),
        });
      });

      if (onCriticalPatterns && newCriticalPatterns.length > 0) {
        onCriticalPatterns(newCriticalPatterns);
      }
    };

    // Update immediately
    updateAnalysis();

    // Update every 5 seconds
    const interval = setInterval(updateAnalysis, 5000);

    return () => {
      clearInterval(interval);
      // Show session summary when component unmounts
      setShowSessionSummary(true);
    };
  }, [onCriticalPatterns]);

  const handleExport = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      patterns: analysis.map(pattern => ({
        category: pattern.category,
        count: pattern.count,
        severity: pattern.severity,
        lastOccurrence: new Date(pattern.lastOccurrence).toISOString(),
        examples: pattern.examples
      })),
      criticalPatterns: criticalPatterns.map(pattern => ({
        category: pattern.category,
        count: pattern.count,
        severity: pattern.severity,
        lastOccurrence: new Date(pattern.lastOccurrence).toISOString(),
        examples: pattern.examples
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    try {
      await Share.share({
        message: jsonString,
        title: 'Log Pattern Analysis Export'
      });
    } catch (error) {
      console.error('Error sharing log analysis:', error);
    }
  };

  const filteredAnalysis = analysis.filter(pattern => 
    severityFilter === 'all' || pattern.severity === severityFilter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.text;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Pattern Monitor</Text>
        <View style={styles.headerButtons}>
          {remoteConfig.isFeatureEnabled('export') && (
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          {remoteConfig.isFeatureEnabled('sessionSummary') && (
            <TouchableOpacity 
              style={styles.summaryButton}
              onPress={() => setShowSessionSummary(true)}
            >
              <Ionicons name="stats-chart-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Severity Filter Buttons */}
      {isRemoteEnabled && (
        <View style={styles.filterContainer}>
          {(['all', 'error', 'warning', 'info'] as SeverityFilter[]).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                severityFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSeverityFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                severityFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {isRemoteEnabled && criticalPatterns.length > 0 && (
        <View style={styles.criticalSection}>
          <Text style={styles.criticalTitle}>Critical Patterns</Text>
          <ScrollView style={styles.criticalList}>
            {criticalPatterns.map((pattern, index) => (
              <View key={index} style={styles.criticalItem}>
                <View style={styles.criticalItemHeader}>
                  <Text style={styles.criticalCategory}>{pattern.category}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{patternCounts[pattern.category] || 0}</Text>
                  </View>
                </View>
                <Text style={styles.criticalCount}>{pattern.count} occurrences</Text>
                <Text style={styles.criticalExample}>
                  Latest: {pattern.examples[0] || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {isRemoteEnabled && (
        <ScrollView style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Pattern Summary</Text>
          {filteredAnalysis.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <View style={styles.patternHeader}>
                <Text style={[
                  styles.patternCategory,
                  { color: getSeverityColor(pattern.severity) }
                ]}>
                  {pattern.category}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{patternCounts[pattern.category] || 0}</Text>
                </View>
              </View>
              <Text style={styles.patternCount}>
                {pattern.count} occurrences, last {new Date(pattern.lastOccurrence).toLocaleTimeString()}
              </Text>
              <Text style={styles.patternExample}>
                Latest: {pattern.examples[0] || 'N/A'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {remoteConfig.isFeatureEnabled('sessionSummary') && (
        <SessionSummary
          visible={showSessionSummary}
          onClose={() => setShowSessionSummary(false)}
          patterns={analysis}
          startTime={sessionStartTime.current}
          endTime={Date.now()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    padding: 8,
    marginRight: 8,
  },
  summaryButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  criticalSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  criticalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 8,
  },
  criticalList: {
    maxHeight: 200,
  },
  criticalItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  criticalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criticalCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
  },
  criticalCount: {
    fontSize: 14,
    color: '#666',
  },
  criticalExample: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summarySection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patternItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  patternCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  patternExample: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 