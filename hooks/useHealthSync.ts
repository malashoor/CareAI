import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

interface HealthSyncConfig {
  enabled: boolean;
  platforms: {
    appleHealth: boolean;
    googleFit: boolean;
  };
  dataTypes: string[];
}

export function useHealthSync(userId: string) {
  const [config, setConfig] = useState<HealthSyncConfig>({
    enabled: false,
    platforms: {
      appleHealth: false,
      googleFit: false,
    },
    dataTypes: []
  });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadConfig();
    if (config.enabled) {
      startSync();
    }
  }, [userId, config.enabled]);

  const loadConfig = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('health_sync_config')
      .eq('id', userId)
      .single();

    if (profile?.health_sync_config) {
      setConfig(profile.health_sync_config);
    }
  };

  const startSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      if (Platform.OS === 'ios' && config.platforms.appleHealth) {
        // Simulate Apple Health sync
        await syncAppleHealth();
      } else if (Platform.OS === 'android' && config.platforms.googleFit) {
        // Simulate Google Fit sync
        await syncGoogleFit();
      } else {
        console.log('Health platform not supported on web');
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Health sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const syncAppleHealth = async () => {
    // Simulate Apple Health data sync
    const mockData = [
      {
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date().toISOString(),
        source: 'apple_health'
      },
      {
        type: 'blood_pressure',
        value: 120,
        unit: 'mmHg',
        timestamp: new Date().toISOString(),
        source: 'apple_health'
      }
    ];

    await saveHealthData(mockData);
  };

  const syncGoogleFit = async () => {
    // Simulate Google Fit data sync
    const mockData = [
      {
        type: 'steps',
        value: 8500,
        unit: 'count',
        timestamp: new Date().toISOString(),
        source: 'google_fit'
      },
      {
        type: 'heart_rate',
        value: 75,
        unit: 'bpm',
        timestamp: new Date().toISOString(),
        source: 'google_fit'
      }
    ];

    await saveHealthData(mockData);
  };

  const saveHealthData = async (data: any[]) => {
    const { error } = await supabase
      .from('health_metrics')
      .insert(
        data.map(item => ({
          user_id: userId,
          type: item.type,
          value: item.value,
          unit: item.unit,
          timestamp: item.timestamp,
          metadata: {
            source: item.source,
            sync_time: new Date().toISOString()
          }
        }))
      );

    if (error) throw error;
  };

  const updateConfig = async (newConfig: Partial<HealthSyncConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    
    const { error } = await supabase
      .from('profiles')
      .update({
        health_sync_config: updatedConfig
      })
      .eq('id', userId);

    if (error) throw error;
    setConfig(updatedConfig);
  };

  return {
    config,
    syncing,
    lastSync,
    updateConfig,
    startSync
  };
}