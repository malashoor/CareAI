import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SystemMetrics {
  memoryUsage: number;
  lastSyncTime: string | null;
  batteryLevel: number;
  syncLogs: Array<{
    timestamp: string;
    status: string;
    details: string;
  }>;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    lastSyncTime: null,
    batteryLevel: 0,
    syncLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Get memory usage
      const memoryInfo = await getMemoryUsage();
      
      // Get last sync time
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      
      // Get battery level
      const batteryLevel = await Battery.getBatteryLevelAsync();
      
      // Get sync logs
      const syncLogs = await getSyncLogs();

      setMetrics({
        memoryUsage: memoryInfo,
        lastSyncTime: lastSync,
        batteryLevel: batteryLevel * 100, // Convert to percentage
        syncLogs
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemoryUsage = async (): Promise<number> => {
    // This is a placeholder. In a real app, you would use a native module
    // to get actual memory usage. For now, we'll return a random value
    return Math.random() * 100;
  };

  const getSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Metrics</Text>
        <TouchableOpacity onPress={fetchMetrics}>
          <Ionicons name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Memory Usage</Text>
          <Text style={styles.metricValue}>{metrics.memoryUsage.toFixed(1)}%</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Battery Level</Text>
          <Text style={styles.metricValue}>{metrics.batteryLevel.toFixed(1)}%</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Last Sync</Text>
          <Text style={styles.metricValue}>
            {metrics.lastSyncTime 
              ? new Date(metrics.lastSyncTime).toLocaleString()
              : 'Never'}
          </Text>
        </View>
      </View>

      <View style={styles.syncLogsContainer}>
        <Text style={styles.sectionTitle}>Recent Sync Logs</Text>
        {metrics.syncLogs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <Text style={styles.logStatus}>{log.status}</Text>
              <Text style={styles.logTimestamp}>
                {new Date(log.timestamp).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.logDetails}>{log.details}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  syncLogsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  logEntry: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a73e8',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  logDetails: {
    fontSize: 14,
    color: '#333',
  },
}); 