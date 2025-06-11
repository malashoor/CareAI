import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';

interface OfflineData {
  key: string;
  value: any;
  timestamp: number;
  syncPriority: 'high' | 'medium' | 'low';
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<OfflineData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Load sync queue from storage
  useEffect(() => {
    loadSyncQueue();
  }, []);

  const loadSyncQueue = async () => {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      if (queue) {
        setSyncQueue(JSON.parse(queue));
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  const saveData = async (
    key: string,
    value: any,
    syncPriority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    try {
      // Save to local storage
      await AsyncStorage.setItem(key, JSON.stringify(value));

      // Add to sync queue if offline
      if (!isOnline) {
        const newQueueItem: OfflineData = {
          key,
          value,
          timestamp: Date.now(),
          syncPriority
        };
        
        const updatedQueue = [...syncQueue, newQueueItem];
        setSyncQueue(updatedQueue);
        await AsyncStorage.setItem('syncQueue', JSON.stringify(updatedQueue));
      } else {
        // Sync immediately if online
        await syncData(key, value);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  const loadData = async (key: string) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  };

  const syncData = async (key: string, value: any) => {
    try {
      // Determine table and operation based on key pattern
      const [table, operation] = key.split(':');
      
      switch (operation) {
        case 'insert':
          await supabase.from(table).insert(value);
          break;
        case 'update':
          await supabase.from(table).update(value.data).eq('id', value.id);
          break;
        case 'delete':
          await supabase.from(table).delete().eq('id', value);
          break;
        default:
          console.warn('Unknown operation:', operation);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  };

  const syncQueuedData = async () => {
    if (isSyncing || !isOnline || syncQueue.length === 0) return;

    setIsSyncing(true);
    try {
      // Sort by priority and timestamp
      const sortedQueue = [...syncQueue].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.syncPriority] !== priorityOrder[b.syncPriority]) {
          return priorityOrder[a.syncPriority] - priorityOrder[b.syncPriority];
        }
        return a.timestamp - b.timestamp;
      });

      for (const item of sortedQueue) {
        await syncData(item.key, item.value);
        setSyncQueue(prev => prev.filter(i => i.key !== item.key));
      }

      await AsyncStorage.setItem('syncQueue', JSON.stringify([]));
    } catch (error) {
      console.error('Error syncing queued data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncQueuedData();
    }
  }, [isOnline]);

  return {
    saveData,
    loadData,
    syncQueuedData,
    isOnline,
    isSyncing,
    queueLength: syncQueue.length,
    clearQueue: async () => {
      setSyncQueue([]);
      await AsyncStorage.setItem('syncQueue', '[]');
    }
  };
}