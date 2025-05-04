import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RemoteConfig {
  logPatternMonitoring: {
    enabled: boolean;
    features: {
      realTimeMonitoring: boolean;
      sessionSummary: boolean;
      crashCorrelation: boolean;
      export: boolean;
    };
  };
}

class RemoteConfigService {
  private static instance: RemoteConfigService;
  private supabase;
  private config: RemoteConfig | null = null;
  private readonly CONFIG_CACHE_KEY = 'remote_config_cache';
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Try to load from cache first
      const cachedConfig = await this.loadFromCache();
      if (cachedConfig) {
        this.config = cachedConfig;
        return;
      }

      // Fetch from Supabase
      const { data, error } = await this.supabase
        .from('remote_config')
        .select('*')
        .eq('environment', process.env.APP_ENV || 'development')
        .single();

      if (error) {
        console.error('Failed to fetch remote config:', error);
        return;
      }

      if (data) {
        this.config = data.config as RemoteConfig;
        await this.saveToCache(this.config);
      }
    } catch (error) {
      console.error('Error initializing remote config:', error);
    }
  }

  private async loadFromCache(): Promise<RemoteConfig | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CONFIG_CACHE_KEY);
      if (!cached) return null;

      const { config, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.CACHE_DURATION_MS) {
        return null;
      }

      return config;
    } catch (error) {
      console.error('Error loading config from cache:', error);
      return null;
    }
  }

  private async saveToCache(config: RemoteConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.CONFIG_CACHE_KEY,
        JSON.stringify({
          config,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error saving config to cache:', error);
    }
  }

  isFeatureEnabled(feature: keyof RemoteConfig['logPatternMonitoring']['features']): boolean {
    if (!this.config) return false;

    const { enabled, features } = this.config.logPatternMonitoring;
    return enabled && features[feature];
  }

  async refreshConfig(): Promise<void> {
    await this.initialize();
  }
}

export const remoteConfig = RemoteConfigService.getInstance(); 