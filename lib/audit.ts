import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export interface AuditEvent {
  action_type: string;
  entity_type: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  severity?: 'info' | 'warning' | 'error';
  status?: 'success' | 'failure';
  error_message?: string;
}

export interface DeviceInfo {
  platform: string;
  model: string;
  osVersion: string;
  appVersion: string;
  deviceId: string;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
}

export class AuditLogger {
  private static async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      platform: Platform.OS,
      model: Device.modelName || 'unknown',
      osVersion: Device.osVersion || 'unknown',
      appVersion: Device.appVersion || 'unknown',
      deviceId: Device.deviceId || 'unknown',
    };
  }

  private static async getLocationInfo(): Promise<LocationInfo> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {};
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {};
    }
  }

  private static async getClientInfo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const deviceInfo = await this.getDeviceInfo();
    const locationInfo = await this.getLocationInfo();

    return {
      user_id: user.id,
      ip_address: 'unknown', // Would need server-side implementation
      user_agent: `${deviceInfo.platform} ${deviceInfo.model} ${deviceInfo.osVersion}`,
      device_info: deviceInfo,
      location_info: locationInfo,
    };
  }

  static async log(event: AuditEvent): Promise<string> {
    try {
      const clientInfo = await this.getClientInfo();
      
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_user_id: clientInfo.user_id,
        p_action_type: event.action_type,
        p_entity_type: event.entity_type,
        p_entity_id: event.entity_id,
        p_old_value: event.old_value,
        p_new_value: event.new_value,
        p_ip_address: clientInfo.ip_address,
        p_user_agent: clientInfo.user_agent,
        p_device_info: clientInfo.device_info,
        p_location_info: clientInfo.location_info,
        p_metadata: event.metadata,
        p_severity: event.severity || 'info',
        p_status: event.status || 'success',
        p_error_message: event.error_message,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  static async getEntityAuditTrail(
    entityType: string,
    entityId: string,
    limit: number = 100
  ) {
    const { data, error } = await supabase.rpc('get_entity_audit_trail', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  static async getUserActivitySummary(
    userId: string,
    days: number = 30
  ) {
    const { data, error } = await supabase.rpc('get_user_activity_summary', {
      p_user_id: userId,
      p_days: days,
    });

    if (error) throw error;
    return data;
  }
}

// Predefined action types for consistency
export const AuditActionTypes = {
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  
  // Health data actions
  HEALTH_DATA_CREATE: 'health_data_create',
  HEALTH_DATA_UPDATE: 'health_data_update',
  HEALTH_DATA_DELETE: 'health_data_delete',
  
  // Appointment actions
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
  
  // Medication actions
  MEDICATION_CREATE: 'medication_create',
  MEDICATION_UPDATE: 'medication_update',
  MEDICATION_DELETE: 'medication_delete',
  
  // Settings actions
  SETTINGS_UPDATE: 'settings_update',
  
  // Admin actions
  ADMIN_ACTION: 'admin_action',
  
  // System actions
  SYSTEM_ERROR: 'system_error',
  SYSTEM_WARNING: 'system_warning',
} as const;

// Predefined entity types for consistency
export const AuditEntityTypes = {
  USER: 'user',
  PROFILE: 'profile',
  HEALTH_DATA: 'health_data',
  APPOINTMENT: 'appointment',
  MEDICATION: 'medication',
  SETTINGS: 'settings',
  SYSTEM: 'system',
} as const; 