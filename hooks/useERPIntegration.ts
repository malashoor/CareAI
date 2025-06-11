import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ERPClient } from '@/lib/erp/client';
import type { ERPIntegration, ERPConfig, ERPCredentials } from '@/lib/erp/types';

export function useERPIntegration() {
  const [integrations, setIntegrations] = useState<ERPIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();

    const subscription = supabase
      .channel('erp_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'erp_integrations'
        },
        () => {
          loadIntegrations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('erp_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const addIntegration = async (
    providerName: string,
    credentials: ERPCredentials,
    config: ERPConfig
  ) => {
    try {
      const { data, error } = await supabase
        .from('erp_integrations')
        .insert({
          provider_name: providerName,
          provider_type: providerName,
          credentials,
          config,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add integration');
      throw err;
    }
  };

  const updateIntegration = async (
    id: string,
    updates: Partial<ERPIntegration>
  ) => {
    try {
      const { data, error } = await supabase
        .from('erp_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update integration');
      throw err;
    }
  };

  const syncData = async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) throw new Error('Integration not found');

      const client = new ERPClient(integration);
      
      const results = await Promise.all([
        integration.config.dataTypes.medications && client.syncMedications(),
        integration.config.dataTypes.healthMetrics && client.syncHealthMetrics()
      ]);

      // Update last sync timestamp
      await updateIntegration(integrationId, {
        last_sync_at: new Date().toISOString(),
        status: 'active',
        error_message: null
      });

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      await updateIntegration(integrationId, {
        status: 'error',
        error_message: errorMessage
      });
      throw err;
    }
  };

  return {
    integrations,
    loading,
    error,
    addIntegration,
    updateIntegration,
    syncData,
    activeIntegrations: integrations.filter(i => i.status === 'active'),
    hasErrors: integrations.some(i => i.status === 'error')
  };
}