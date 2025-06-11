import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  user_role: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  metadata: any;
  severity: string;
  status: string;
  error_message?: string;
}

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [filter, setFilter] = useState({
    actionType: '',
    entityType: '',
    severity: '',
    status: '',
  });

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('comprehensive_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return '#FF3B30';
      case 'warning':
        return '#FF9500';
      default:
        return '#34C759';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? '#34C759' : '#FF3B30';
  };

  const filteredLogs = logs.filter(log => {
    if (filter.actionType && log.action_type !== filter.actionType) return false;
    if (filter.entityType && log.entity_type !== filter.entityType) return false;
    if (filter.severity && log.severity !== filter.severity) return false;
    if (filter.status && log.status !== filter.status) return false;
    return true;
  });

  const renderLogEntry = (log: AuditLogEntry) => (
    <TouchableOpacity
      key={log.id}
      style={styles.logEntry}
      onPress={() => setSelectedLog(log)}>
      <View style={styles.logHeader}>
        <Text style={styles.timestamp}>
          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getSeverityColor(log.severity) }]}>
            <Text style={styles.badgeText}>{log.severity}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(log.status) }]}>
            <Text style={styles.badgeText}>{log.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.logContent}>
        <Text style={styles.actionType}>{log.action_type}</Text>
        <Text style={styles.entityType}>{log.entity_type}</Text>
        <Text style={styles.userInfo}>
          {log.user_email} ({log.user_role})
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLogDetails = (log: AuditLogEntry) => (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Log Details</Text>
        <TouchableOpacity onPress={() => setSelectedLog(null)}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detailsContent}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Timestamp:</Text>
          <Text style={styles.detailValue}>
            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>User:</Text>
          <Text style={styles.detailValue}>{log.user_email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>{log.user_role}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Action:</Text>
          <Text style={styles.detailValue}>{log.action_type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Entity:</Text>
          <Text style={styles.detailValue}>{log.entity_type}</Text>
        </View>

        {log.old_value && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Old Value:</Text>
            <Text style={styles.detailValue}>
              {JSON.stringify(log.old_value, null, 2)}
            </Text>
          </View>
        )}

        {log.new_value && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>New Value:</Text>
            <Text style={styles.detailValue}>
              {JSON.stringify(log.new_value, null, 2)}
            </Text>
          </View>
        )}

        {log.error_message && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Error:</Text>
            <Text style={[styles.detailValue, styles.errorText]}>
              {log.error_message}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Logs</Text>
        <View style={styles.filters}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilter({ ...filter, actionType: '' })}>
            <Text style={styles.filterButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView
          style={styles.logsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {filteredLogs.map(renderLogEntry)}
        </ScrollView>
      )}

      {selectedLog && (
        <View style={styles.modal}>
          {renderLogDetails(selectedLog)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
  },
  logEntry: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
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
  timestamp: {
    fontSize: 14,
    color: '#8E8E93',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logContent: {
    gap: 4,
  },
  actionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  entityType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  userInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  detailsContent: {
    maxHeight: '80%',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
  },
  errorText: {
    color: '#FF3B30',
  },
}); 