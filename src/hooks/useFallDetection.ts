import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

interface FallEvent {
  id: string;
  detected_at: string;
  severity: 'low' | 'high';
  response_status: 'pending' | 'responded' | 'resolved';
  location?: {
    latitude: number;
    longitude: number;
  };
  acceleration: number;
}

interface FallDetectionState {
  monitoring: boolean;
  events: FallEvent[];
  criticalEvents: FallEvent[];
  sensitivity: number;
}

// Constants for fall detection
const ACCELERATION_THRESHOLD = 1.8; // Base threshold for fall detection
const HIGH_SEVERITY_THRESHOLD = 2.8; // Threshold for high severity falls
const DEBOUNCE_TIME = 2000; // Minimum time between fall detections (2 seconds)
const SUDDEN_CHANGE_THRESHOLD = 0.8; // Threshold for sudden acceleration changes

export const useFallDetection = (userId: string) => {
  const [state, setState] = useState<FallDetectionState>({
    monitoring: false,
    events: [],
    criticalEvents: [],
    sensitivity: 1.0,
  });

  const lastFallTime = useRef<number>(0);
  const previousAcceleration = useRef<number>(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startMonitoring = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
        }

        await Accelerometer.setUpdateInterval(100); // Update every 100ms
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const currentTime = Date.now();
          const acceleration = Math.sqrt(x * x + y * y + z * z);
          
          // Calculate sudden change in acceleration
          const accelerationChange = Math.abs(acceleration - previousAcceleration.current);
          previousAcceleration.current = acceleration;

          // Check for fall conditions
          const isFallDetected = 
            acceleration > (ACCELERATION_THRESHOLD * state.sensitivity) ||
            (accelerationChange > SUDDEN_CHANGE_THRESHOLD && 
             currentTime - lastFallTime.current > DEBOUNCE_TIME);

          if (isFallDetected) {
            lastFallTime.current = currentTime;
            
            // Get location if permission is granted
            const getLocation = async () => {
              try {
                const location = await Location.getCurrentPositionAsync({});
                return {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                };
              } catch (error) {
                console.error('Error getting location:', error);
                return undefined;
              }
            };

            const location = getLocation();
            const severity = acceleration > HIGH_SEVERITY_THRESHOLD ? 'high' : 'low';

            const newEvent: FallEvent = {
              id: Math.random().toString(36).substr(2, 9),
              detected_at: new Date().toISOString(),
              severity,
              response_status: 'pending',
              location,
              acceleration,
            };

            setState(prev => {
              const updatedEvents = [newEvent, ...prev.events];
              const updatedCriticalEvents = severity === 'high' 
                ? [newEvent, ...prev.criticalEvents]
                : prev.criticalEvents;

              return {
                ...prev,
                events: updatedEvents,
                criticalEvents: updatedCriticalEvents,
              };
            });
          }
        });
        
        setState(prev => ({ ...prev, monitoring: true }));
      } catch (error) {
        console.error('Error starting fall detection:', error);
      }
    };

    const stopMonitoring = () => {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
      setState(prev => ({ ...prev, monitoring: false }));
    };

    if (state.monitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [state.monitoring, state.sensitivity]);

  const startMonitoring = () => {
    setState(prev => ({ ...prev, monitoring: true }));
  };

  const stopMonitoring = () => {
    setState(prev => ({ ...prev, monitoring: false }));
  };

  const setSensitivity = (value: number) => {
    setState(prev => ({ ...prev, sensitivity: value }));
  };

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    setSensitivity,
  };
}; 