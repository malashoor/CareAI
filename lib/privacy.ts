import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export interface ConsentPreferences {
  health_data_tracking: boolean;
  location_tracking: boolean;
  voice_recording: boolean;
  sharing_with_family: boolean;
  sharing_with_professionals: boolean;
  date_of_birth_use: boolean;
  last_updated: string;
}

export interface ConsentChange {
  changed_fields: string[];
  previous_values: Partial<ConsentPreferences>;
  new_values: Partial<ConsentPreferences>;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string;
  completed_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'scheduled' | 'cancelled' | 'completed';
  scheduled_deletion_date: string;
  cancelled_at?: string;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  platform: string;
  model: string;
  os_version: string;
  app_version: string;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
}

export enum ActivityTypes {
  CONSENT_CHANGE = 'consent_change',
  EXPORT_REQUEST = 'export_request',
  EXPORT_DOWNLOAD = 'export_download',
  ACCOUNT_DELETION_REQUEST = 'account_deletion_request',
  ACCOUNT_DELETION_CANCEL = 'account_deletion_cancel',
  PAGE_VISIT = 'page_visit',
  DATA_ACCESS = 'data_access',
}

export class PrivacyManager {
  private static async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      platform: Platform.OS,
      model: Device.modelName || 'unknown',
      os_version: Device.osVersion || '',
      app_version: Device.osName || '',
    };
  }

  private static async getLocationInfo(): Promise<LocationInfo | undefined> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return undefined;

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude || undefined,
        longitude: location.coords.longitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }

  static async getConsentPreferences(): Promise<ConsentPreferences> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('consent_preferences')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data.consent_preferences || {
      health_data_tracking: true,
      location_tracking: true,
      voice_recording: true,
      sharing_with_family: true,
      sharing_with_professionals: true,
      date_of_birth_use: true,
      last_updated: new Date().toISOString(),
    };
  }

  static async updateConsentPreferences(
    updates: Partial<ConsentPreferences>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const currentPrefs = await this.getConsentPreferences();
    const newPrefs = {
      ...currentPrefs,
      ...updates,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update({ consent_preferences: newPrefs })
      .eq('id', user.id);

    if (error) throw error;

    // Log consent changes
    const changedFields = Object.keys(updates);
    const previousValues = Object.fromEntries(
      changedFields.map(field => [field, currentPrefs[field as keyof ConsentPreferences]])
    );
    const newValues = Object.fromEntries(
      changedFields.map(field => [field, newPrefs[field as keyof ConsentPreferences]])
    );

    await this.logConsentChange({
      changed_fields: changedFields,
      previous_values: previousValues,
      new_values: newValues,
    });
  }

  private static async logConsentChange(change: {
    changed_fields: string[];
    previous_values: Record<string, any>;
    new_values: Record<string, any>;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const deviceInfo = await this.getDeviceInfo();
    const locationInfo = await this.getLocationInfo();

    const { error } = await supabase.from('consent_log').insert({
      user_id: user.id,
      changed_fields: change.changed_fields,
      previous_values: change.previous_values,
      new_values: change.new_values,
      device_info: deviceInfo,
      location_info: locationInfo,
    });

    if (error) throw error;
  }

  static async requestDataExport(): Promise<DataExportRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) throw error;

    // Log the export request
    await this.logUserActivity(
      ActivityTypes.EXPORT_REQUEST,
      '/settings/privacy',
      { request_id: data.id }
    );

    return data;
  }

  static async getExportStatus(requestId: string): Promise<DataExportRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  static async requestAccountDeletion(): Promise<AccountDeletionRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const scheduledDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        status: 'scheduled',
        scheduled_deletion_date: scheduledDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log the deletion request
    await this.logUserActivity(
      ActivityTypes.ACCOUNT_DELETION_REQUEST,
      '/settings/privacy',
      { request_id: data.id }
    );

    return data;
  }

  static async cancelAccountDeletion(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('account_deletion_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('status', 'scheduled');

    if (error) throw error;

    // Log the cancellation
    await this.logUserActivity(
      ActivityTypes.ACCOUNT_DELETION_CANCEL,
      '/settings/privacy'
    );
  }

  static async logUserActivity(
    activityType: ActivityTypes,
    pageUrl: string,
    actionDetails?: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const deviceInfo = await this.getDeviceInfo();
    const locationInfo = await this.getLocationInfo();

    const { error } = await supabase.from('user_activity_log').insert({
      user_id: user.id,
      activity_type: activityType,
      page_url: pageUrl,
      action_details: actionDetails,
      device_info: deviceInfo,
      location_info: locationInfo,
    });

    if (error) throw error;
  }

  static async downloadExportedData(filePath: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Download the file from Supabase storage
    const { data, error } = await supabase.storage
      .from('exports')
      .download(filePath);

    if (error) throw error;

    // Log the download activity
    await this.logUserActivity(
      ActivityTypes.EXPORT_DOWNLOAD,
      '/settings/privacy',
      { file_path: filePath }
    );
  }
} 