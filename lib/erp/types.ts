import { Database } from '@/types/supabase';

export type ERPProvider = {
  id: string;
  name: string;
  type: 'epic' | 'cerner' | 'allscripts';
  baseUrl: string;
  authType: 'oauth2' | 'apikey';
};

export type ERPIntegration = Database['public']['Tables']['erp_integrations']['Row'];
export type ERPSyncLog = Database['public']['Tables']['erp_sync_logs']['Row'];

export interface ERPCredentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface ERPConfig {
  syncInterval: number;
  dataTypes: {
    medications: boolean;
    healthMetrics: boolean;
    appointments: boolean;
  };
  webhookUrl?: string;
  retryAttempts: number;
}

export interface ERPSyncResult {
  success: boolean;
  recordCount?: number;
  errorMessage?: string;
}

export interface ERPWebhookPayload {
  type: 'medication' | 'appointment' | 'health_metric';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  provider: string;
}