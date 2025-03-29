import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extend Performance interface for memory API
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface CacheItem {
  key: string;
  size: number;
  lastAccessed: number;
}

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  batteryLevel?: number;
  networkType?: string;
  fps: number;
  lastUpdate: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    fps: 60,
    lastUpdate: 0
  });

  const [isOptimized, setIsOptimized] = useState(false);

  // Monitor FPS
  const measureFPS = useCallback(() => {
    if (Platform.OS === 'web') {
      let frameCount = 0;
      let lastTime = performance.now();
      let animationFrameId: number;
      let isActive = true;

      const measure = () => {
        if (!isActive) return;

        const currentTime = performance.now();
        frameCount++;

        if (currentTime - lastTime >= 1000) {
          // Batch state updates
          setMetrics(prev => ({
            ...prev,
            fps: frameCount,
            lastUpdate: currentTime
          }));
          
          frameCount = 0;
          lastTime = currentTime;
        }

        animationFrameId = requestAnimationFrame(measure);
      };

      animationFrameId = requestAnimationFrame(measure);

      // Cleanup function
      return () => {
        isActive = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, []);

  // Monitor network conditions
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setMetrics(prev => ({
        ...prev,
        networkType: state.type
      }));

      // Adjust data sync based on network type
      if (state.type === 'wifi') {
        // Enable high-quality data sync
        AsyncStorage.setItem('syncQuality', 'high');
      } else {
        // Reduce sync frequency and quality
        AsyncStorage.setItem('syncQuality', 'low');
      }
    });

    return () => unsubscribe();
  }, []);

  // Memory usage optimization
  const optimizeMemory = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        // Get all cache keys
        const cacheKeys = await AsyncStorage.getAllKeys();
        
        // Prioritize cache items
        const cacheItems = await Promise.all(
          cacheKeys
            .filter(key => key.startsWith('temp_') || key.startsWith('cache_'))
            .map(async (key: string) => {
              const value = await AsyncStorage.getItem(key);
              const size = value ? value.length : 0;
              const lastAccessed = await AsyncStorage.getItem(`${key}_lastAccessed`);
              return {
                key,
                size,
                lastAccessed: lastAccessed ? parseInt(lastAccessed, 10) : 0
              };
            })
        );

        // Sort by last accessed and size
        cacheItems.sort((a: CacheItem, b: CacheItem) => {
          // First by last accessed (oldest first)
          if (a.lastAccessed !== b.lastAccessed) {
            return a.lastAccessed - b.lastAccessed;
          }
          // Then by size (largest first)
          return b.size - a.size;
        });

        // Calculate total cache size
        const totalSize = cacheItems.reduce((sum: number, item: CacheItem) => sum + item.size, 0);
        const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

        // Remove items if total size exceeds limit
        if (totalSize > MAX_CACHE_SIZE) {
          const itemsToRemove = [];
          let currentSize = totalSize;

          for (const item of cacheItems) {
            if (currentSize <= MAX_CACHE_SIZE) break;
            itemsToRemove.push(item.key);
            currentSize -= item.size;
          }

          if (itemsToRemove.length > 0) {
            await AsyncStorage.multiRemove(itemsToRemove);
          }
        }

        // Monitor heap size if available
        const performanceWithMemory = performance as PerformanceWithMemory;
        if (performanceWithMemory?.memory) {
          const memoryUsage = performanceWithMemory.memory.usedJSHeapSize;
          const memoryLimit = performanceWithMemory.memory.jsHeapSizeLimit;
          
          // Only update metrics if memory usage is significant
          if (memoryUsage > memoryLimit * 0.8) {
            setMetrics(prev => ({
              ...prev,
              memoryUsage
            }));
          }
        }
      } catch (error) {
        console.error('Memory optimization error:', error);
      }
    }
  }, []);

  // Background sync optimization
  const optimizeBackgroundSync = useCallback(() => {
    let syncInterval: NodeJS.Timeout;
    let lastSyncTime = 0;
    const MIN_SYNC_INTERVAL = 5000; // Minimum time between syncs
    const SYNC_QUALITY_CHECK_INTERVAL = 60000; // Check sync quality every minute

    const performSync = async () => {
      const now = Date.now();
      if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
        return; // Skip if too soon since last sync
      }

      try {
        const syncQuality: string | null = await AsyncStorage.getItem('syncQuality');
        const interval = syncQuality === 'high' ? 5000 : 15000;

        // Perform sync operations
        await AsyncStorage.setItem('lastSync', now.toString());
        lastSyncTime = now;

        // Update sync interval if needed
        clearInterval(syncInterval);
        syncInterval = setInterval(performSync, interval);
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    return {
      start: () => {
        // Initial sync quality check
        AsyncStorage.getItem('syncQuality').then((syncQuality: string | null) => {
          const interval = syncQuality === 'high' ? 5000 : 15000;
          syncInterval = setInterval(performSync, interval);
        });

        // Periodically check and adjust sync quality
        setInterval(async () => {
          const syncQuality: string | null = await AsyncStorage.getItem('syncQuality');
          const interval = syncQuality === 'high' ? 5000 : 15000;
          
          // Only update interval if it has changed
          clearInterval(syncInterval);
          syncInterval = setInterval(performSync, interval);
        }, SYNC_QUALITY_CHECK_INTERVAL);
      },
      stop: () => {
        if (syncInterval) {
          clearInterval(syncInterval);
        }
      }
    };
  }, []);

  // Initialize optimizations
  useEffect(() => {
    if (!isOptimized) {
      const cleanupFPS = measureFPS();
      optimizeMemory();
      const backgroundSync = optimizeBackgroundSync();
      backgroundSync.start();

      setIsOptimized(true);

      return () => {
        cleanupFPS?.();
        backgroundSync.stop();
      };
    }
  }, [isOptimized, measureFPS, optimizeMemory, optimizeBackgroundSync]);

  return {
    metrics,
    isOptimized
  };
}