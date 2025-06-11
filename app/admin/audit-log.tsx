import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface AuditLogEntry {
  id: string;
  tab_id: string;
  user_id: string;
  change_type: string;
  old_value: any;
  new_value: any;
  created_at: string;
  tab: {
    title: string;
  };
  user: {
    email: string;
  };
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('tab_config_audit_log')
        .select(`
          *,
          tab:tab_configurations(title),
          user:auth.users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (entry: AuditLogEntry) => {
    switch (entry.change_type) {
      case 'role_update':
        return `Updated roles from ${entry.old_value.roles.join(', ')} to ${entry.new_value.roles.join(', ')}`;
      case 'enable_toggle':
        return `Changed status to ${entry.new_value.isEnabled ? 'enabled' : 'disabled'}`;
      case 'label_update':
        return `Updated title from "${entry.old_value.title}" to "${entry.new_value.title}"`;
      case 'icon_update':
        return `Updated icon from "${entry.old_value.icon}" to "${entry.new_value.icon}"`;
      default:
        return 'Unknown change';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Log</Text>
        <TouchableOpacity onPress={fetchLogs}>
          <Ionicons name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {logs.map(log => (
        <View key={log.id} style={styles.logEntry}>
          <View style={styles.logHeader}>
            <Text style={styles.tabTitle}>{log.tab.title}</Text>
            <Text style={styles.timestamp}>
              {new Date(log.created_at).toLocaleString()}
            </Text>
          </View>
          
          <Text style={styles.changeText}>{formatChange(log)}</Text>
          
          <View style={styles.logFooter}>
            <Text style={styles.userEmail}>by {log.user.email}</Text>
          </View>
        </View>
      ))}
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
  logEntry: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
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
  tabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  changeText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
}); 