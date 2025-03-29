import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { Activity, RefreshCw, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthSync } from '@/hooks/useHealthSync';

interface Props {
  userId: string;
}

export default function HealthSyncSettings({ userId }: Props) {
  const { config, syncing, lastSync, updateConfig, startSync } = useHealthSync(userId);

  const handleToggleSync = async (enabled: boolean) => {
    await updateConfig({ enabled });
  };

  const handleTogglePlatform = async (platform: 'appleHealth' | 'googleFit') => {
    await updateConfig({
      platforms: {
        ...config.platforms,
        [platform]: !config.platforms[platform]
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Activity color="#007AFF" size={24} />
        <Text style={styles.title}>Health Data Sync</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Health Sync</Text>
          <Switch
            value={config.enabled}
            onValueChange={handleToggleSync}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          />
        </View>

        {Platform.OS === 'ios' && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Apple Health</Text>
            <Switch
              value={config.platforms.appleHealth}
              onValueChange={() => handleTogglePlatform('appleHealth')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              disabled={!config.enabled}
            />
          </View>
        )}

        {Platform.OS === 'android' && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Google Fit</Text>
            <Switch
              value={config.platforms.googleFit}
              onValueChange={() => handleTogglePlatform('googleFit')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              disabled={!config.enabled}
            />
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <Shield color="#007AFF" size={20} />
        <Text style={styles.infoText}>
          Your health data is encrypted and securely synced. Only authorized caregivers can access this information.
        </Text>
      </View>

      {config.enabled && (
        <View style={styles.syncStatus}>
          <Text style={styles.syncLabel}>
            Last synced: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
          </Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={startSync}
            disabled={syncing}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.syncGradient}>
              <RefreshCw color="#FFF" size={20} />
              <Text style={styles.syncText}>
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dataTypes}>
        <Text style={styles.dataTypesTitle}>Synced Data Types</Text>
        <View style={styles.dataTypesList}>
          <View style={styles.dataTypeItem}>
            <Activity color="#34C759" size={16} />
            <Text style={styles.dataTypeText}>Heart Rate</Text>
          </View>
          <View style={styles.dataTypeItem}>
            <Activity color="#FF9500" size={16} />
            <Text style={styles.dataTypeText}>Blood Pressure</Text>
          </View>
          <View style={styles.dataTypeItem}>
            <Activity color="#5856D6" size={16} />
            <Text style={styles.dataTypeText}>Steps</Text>
          </View>
          <View style={styles.dataTypeItem}>
            <Activity color="#FF2D55" size={16} />
            <Text style={styles.dataTypeText}>Sleep</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginLeft: 12,
  },
  section: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 12,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  syncLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  syncButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  syncGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  syncText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  dataTypes: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  dataTypesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  dataTypesList: {
    gap: 8,
  },
  dataTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  dataTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
  },
});