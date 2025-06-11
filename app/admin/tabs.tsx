import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface TabConfig {
  id: string;
  name: string;
  title: string;
  icon: string;
  order: number;
  roles: string[];
  isEnabled: boolean;
}

const AVAILABLE_ROLES = ['senior', 'child', 'medical'];

export default function TabAdminPanel() {
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      const { data, error } = await supabase
        .from('tab_configurations')
        .select('*')
        .order('order');

      if (error) throw error;
      setTabs(data || []);
    } catch (error) {
      console.error('Error fetching tabs:', error);
      Alert.alert('Error', 'Failed to load tab configurations');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (tabId: string, role: string) => {
    try {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;

      const newRoles = tab.roles.includes(role)
        ? tab.roles.filter(r => r !== role)
        : [...tab.roles, role];

      const { error } = await supabase
        .from('tab_configurations')
        .update({ roles: newRoles })
        .eq('id', tabId);

      if (error) throw error;

      setTabs(tabs.map(t => 
        t.id === tabId ? { ...t, roles: newRoles } : t
      ));
    } catch (error) {
      console.error('Error updating tab roles:', error);
      Alert.alert('Error', 'Failed to update tab roles');
    }
  };

  const toggleEnabled = async (tabId: string) => {
    try {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;

      const { error } = await supabase
        .from('tab_configurations')
        .update({ isEnabled: !tab.isEnabled })
        .eq('id', tabId);

      if (error) throw error;

      setTabs(tabs.map(t => 
        t.id === tabId ? { ...t, isEnabled: !t.isEnabled } : t
      ));
    } catch (error) {
      console.error('Error toggling tab:', error);
      Alert.alert('Error', 'Failed to toggle tab status');
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
        <Text style={styles.title}>Tab Role Management</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {tabs.map(tab => (
        <View key={tab.id} style={styles.tabCard}>
          <View style={styles.tabHeader}>
            <View style={styles.tabInfo}>
              <Ionicons name={tab.icon as any} size={24} color="#666" />
              <Text style={styles.tabTitle}>{tab.title}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => toggleEnabled(tab.id)}
              style={[
                styles.enableButton,
                tab.isEnabled ? styles.enabled : styles.disabled
              ]}
            >
              <Text style={styles.enableButtonText}>
                {tab.isEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rolesContainer}>
            {AVAILABLE_ROLES.map(role => (
              <TouchableOpacity
                key={role}
                onPress={() => toggleRole(tab.id, role)}
                style={[
                  styles.roleButton,
                  tab.roles.includes(role) ? styles.roleSelected : styles.roleUnselected
                ]}
              >
                <Text style={[
                  styles.roleText,
                  tab.roles.includes(role) ? styles.roleTextSelected : styles.roleTextUnselected
                ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
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
  tabCard: {
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
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  enableButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  enabled: {
    backgroundColor: '#e6f4ea',
  },
  disabled: {
    backgroundColor: '#fce8e6',
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  roleSelected: {
    backgroundColor: '#e8f0fe',
    borderColor: '#1a73e8',
  },
  roleUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleTextSelected: {
    color: '#1a73e8',
  },
  roleTextUnselected: {
    color: '#666',
  },
}); 