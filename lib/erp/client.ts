import { supabase } from '@/lib/supabase';
import type {
  ERPProvider,
  ERPIntegration,
  ERPCredentials,
  ERPConfig,
  ERPSyncResult,
  ERPWebhookPayload
} from './types';

export class ERPClient {
  private provider: ERPProvider;
  private integration: ERPIntegration;
  private credentials: ERPCredentials;
  private config: ERPConfig;

  constructor(integration: ERPIntegration) {
    this.integration = integration;
    this.credentials = integration.credentials;
    this.config = integration.config;
    this.provider = this.getProviderConfig(integration.provider_name);
  }

  private getProviderConfig(providerName: string): ERPProvider {
    // In production, this would load from a configuration service
    const providers: Record<string, ERPProvider> = {
      epic: {
        id: 'epic',
        name: 'Epic Systems',
        type: 'epic',
        baseUrl: 'https://api.epic-fhir.com/v1',
        authType: 'oauth2'
      },
      cerner: {
        id: 'cerner',
        name: 'Cerner',
        type: 'cerner',
        baseUrl: 'https://api.cerner.com/v1',
        authType: 'oauth2'
      },
      allscripts: {
        id: 'allscripts',
        name: 'Allscripts',
        type: 'allscripts',
        baseUrl: 'https://api.allscripts.com/v1',
        authType: 'apikey'
      }
    };

    const provider = providers[providerName];
    if (!provider) {
      throw new Error(`Unsupported ERP provider: ${providerName}`);
    }

    return provider;
  }

  private async refreshToken(): Promise<void> {
    if (this.provider.authType !== 'oauth2') return;

    try {
      // Implement OAuth2 token refresh logic
      const response = await fetch(`${this.provider.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refreshToken,
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update credentials in database
      await supabase
        .from('erp_integrations')
        .update({
          credentials: {
            ...this.credentials,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
          }
        })
        .eq('id', this.integration.id);

    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.provider.authType === 'oauth2') {
      if (this.isTokenExpired()) {
        await this.refreshToken();
      }
      headers['Authorization'] = `Bearer ${this.credentials.accessToken}`;
    } else {
      headers['X-API-Key'] = this.credentials.apiKey!;
    }

    const response = await fetch(`${this.provider.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`ERP request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private isTokenExpired(): boolean {
    if (!this.credentials.expiresAt) return true;
    return new Date(this.credentials.expiresAt) <= new Date();
  }

  private async logSync(
    type: string,
    status: 'success' | 'error' | 'retry',
    result: ERPSyncResult
  ): Promise<void> {
    await supabase
      .from('erp_sync_logs')
      .insert({
        integration_id: this.integration.id,
        sync_type: type,
        status,
        data_type: type,
        record_count: result.recordCount,
        error_message: result.errorMessage
      });
  }

  async syncMedications(): Promise<ERPSyncResult> {
    try {
      const medications = await this.request('/medications');
      
      // Process and store medications
      for (const med of medications) {
        await supabase
          .from('medications')
          .upsert({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            instructions: med.instructions,
            erp_ref_id: med.id,
            last_erp_sync: new Date().toISOString()
          }, {
            onConflict: 'erp_ref_id'
          });
      }

      const result = { success: true, recordCount: medications.length };
      await this.logSync('medications', 'success', result);
      return result;

    } catch (error) {
      const result = {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      await this.logSync('medications', 'error', result);
      return result;
    }
  }

  async syncHealthMetrics(): Promise<ERPSyncResult> {
    try {
      const metrics = await this.request('/health-metrics');
      
      // Process and store health metrics
      for (const metric of metrics) {
        await supabase
          .from('health_metrics')
          .upsert({
            type: metric.type,
            value: metric.value,
            unit: metric.unit,
            timestamp: metric.timestamp,
            erp_ref_id: metric.id,
            last_erp_sync: new Date().toISOString()
          }, {
            onConflict: 'erp_ref_id'
          });
      }

      const result = { success: true, recordCount: metrics.length };
      await this.logSync('health_metrics', 'success', result);
      return result;

    } catch (error) {
      const result = {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      await this.logSync('health_metrics', 'error', result);
      return result;
    }
  }

  async handleWebhook(payload: ERPWebhookPayload): Promise<void> {
    try {
      switch (payload.type) {
        case 'medication':
          await this.processMedicationWebhook(payload);
          break;
        case 'health_metric':
          await this.processHealthMetricWebhook(payload);
          break;
        case 'appointment':
          await this.processAppointmentWebhook(payload);
          break;
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }

  private async processMedicationWebhook(payload: ERPWebhookPayload): Promise<void> {
    const { action, data } = payload;

    switch (action) {
      case 'create':
      case 'update':
        await supabase
          .from('medications')
          .upsert({
            name: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            instructions: data.instructions,
            erp_ref_id: data.id,
            last_erp_sync: new Date().toISOString()
          }, {
            onConflict: 'erp_ref_id'
          });
        break;

      case 'delete':
        // Mark as inactive instead of deleting
        await supabase
          .from('medications')
          .update({ active: false })
          .eq('erp_ref_id', data.id);
        break;
    }
  }

  private async processHealthMetricWebhook(payload: ERPWebhookPayload): Promise<void> {
    const { action, data } = payload;

    if (action === 'create' || action === 'update') {
      await supabase
        .from('health_metrics')
        .upsert({
          type: data.type,
          value: data.value,
          unit: data.unit,
          timestamp: data.timestamp,
          erp_ref_id: data.id,
          last_erp_sync: new Date().toISOString()
        }, {
          onConflict: 'erp_ref_id'
        });
    }
  }

  private async processAppointmentWebhook(payload: ERPWebhookPayload): Promise<void> {
    // Implement appointment processing logic
    console.log('Processing appointment webhook:', payload);
  }
}