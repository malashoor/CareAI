import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

interface FallEvent {
  id: string;
  user_id: string;
  detected_at: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  severity: 'low' | 'medium' | 'high';
  response_status: 'detected' | 'notified' | 'responded' | 'resolved';
  responder_id?: string;
  device_data: any;
  notes?: string;
  acceleration?: number;
}

interface FallDetectionSettings {
  sensitivity: number;
  mockMode: boolean;
  emergencyContacts: string[];
}

// Constants for fall detection
const ACCELERATION_THRESHOLD = 1.8;
const HIGH_SEVERITY_THRESHOLD = 2.8;
const DEBOUNCE_TIME = 3000; // 3 seconds between detections
const SUDDEN_CHANGE_THRESHOLD = 0.8;

export function useFallDetection(userId: string) {
  const [events, setEvents] = useState<FallEvent[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<FallDetectionSettings>({
    sensitivity: 1.0,
    mockMode: __DEV__, // Use mock mode in development
    emergencyContacts: []
  });

  // Sensor monitoring refs
  const accelerometerSubscription = useRef<any>(null);
  const lastFallTime = useRef<number>(0);
  const previousAcceleration = useRef<number>(0);
  const mockTimer = useRef<any>(null);

  useEffect(() => {
    // Only load data and set up subscriptions if userId is valid
    if (!userId || userId === 'undefined' || userId === '') {
      console.warn('Invalid userId provided to useFallDetection:', userId);
      setLoading(false);
      return;
    }

    loadEvents();
    loadSettings();

    const subscription = supabase
      .channel('fall_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fall_detection_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            handleNewEvent(payload.new as FallEvent);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      stopDeviceMonitoring();
    };
  }, [userId]);

  const loadEvents = async () => {
    // Validate userId before making database query
    if (!userId || userId === 'undefined' || userId === '') {
      console.warn('Invalid userId provided to loadEvents:', userId);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fall_detection_events')
        .select(`
          *,
          responder:profiles!fall_detection_events_responder_id_fkey(
            id, name, role
          )
        `)
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading fall events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading fall events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('emergency_contacts, fall_detection_settings')
        .eq('id', userId)
        .single();

      if (profile) {
        setSettings(prev => ({
          ...prev,
          emergencyContacts: profile.emergency_contacts || [],
          ...profile.fall_detection_settings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNewEvent = async (event: FallEvent) => {
    setEvents(current => [event, ...current]);

    // Trigger emergency notifications
    if (event.severity === 'high') {
      if (Platform.OS !== 'web') {
        await Speech.speak(
          'Fall detected! Emergency contacts are being notified. Please respond if you are able.',
          {
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0
          }
        );
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Show alert for high severity events
      Alert.alert(
        'Fall Detected!',
        'A high-severity fall has been detected. Emergency contacts will be notified.',
        [
          { text: 'I\'m OK', onPress: () => markEventAsResolved(event.id) },
          { text: 'Get Help', style: 'default' }
        ]
      );
    }
  };

  const startDeviceMonitoring = async () => {
    if (settings.mockMode) {
      startMockMonitoring();
      return;
    }

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
      }

      // Set up accelerometer monitoring
      await Accelerometer.setUpdateInterval(100);
      accelerometerSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
        const currentTime = Date.now();
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        
        // Calculate sudden change in acceleration
        const accelerationChange = Math.abs(acceleration - previousAcceleration.current);
        previousAcceleration.current = acceleration;

        // Check for fall conditions
        const isFallDetected = 
          acceleration > (ACCELERATION_THRESHOLD * settings.sensitivity) ||
          (accelerationChange > SUDDEN_CHANGE_THRESHOLD && 
           currentTime - lastFallTime.current > DEBOUNCE_TIME);

        if (isFallDetected) {
          lastFallTime.current = currentTime;
          handleFallDetected(acceleration);
        }
      });

      console.log('Device monitoring started');
    } catch (error) {
      console.error('Error starting device monitoring:', error);
      Alert.alert('Error', 'Failed to start device monitoring. Using mock mode instead.');
      startMockMonitoring();
    }
  };

  const startMockMonitoring = () => {
    // Simulate random fall events for testing
    const intervals = [30000, 60000, 120000]; // 30s, 1min, 2min
    const randomInterval = intervals[Math.floor(Math.random() * intervals.length)];

    mockTimer.current = setTimeout(() => {
      if (monitoring) {
        const mockAcceleration = 2.0 + Math.random() * 1.5; // Random acceleration between 2.0-3.5
        handleFallDetected(mockAcceleration);
        
        // Schedule next mock event
        if (monitoring && settings.mockMode) {
          startMockMonitoring();
        }
      }
    }, randomInterval);

    console.log('Mock monitoring started - next event in', randomInterval / 1000, 'seconds');
  };

  const stopDeviceMonitoring = () => {
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
      accelerometerSubscription.current = null;
    }

    if (mockTimer.current) {
      clearTimeout(mockTimer.current);
      mockTimer.current = null;
    }

    console.log('Device monitoring stopped');
  };

  const handleFallDetected = async (acceleration: number) => {
    try {
      let location;
      
      // Try to get current location
      try {
        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000
        });
        location = {
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
          accuracy: locationResult.coords.accuracy || 0
        };
      } catch (error) {
        console.log('Could not get location:', error);
      }

      const severity = acceleration > HIGH_SEVERITY_THRESHOLD ? 'high' : 
                      acceleration > ACCELERATION_THRESHOLD * 1.5 ? 'medium' : 'low';

      const fallEvent = await recordFallEvent(severity, location, {
        acceleration,
        timestamp: new Date().toISOString(),
        device: Platform.OS,
        mockMode: settings.mockMode
      });

      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(
          severity === 'high' ? Haptics.ImpactFeedbackStyle.Heavy : 
          Haptics.ImpactFeedbackStyle.Medium
        );
        
        // Announce the detection
        await Speech.speak(
          `${severity} severity fall detected at ${new Date().toLocaleTimeString()}`,
          { rate: 0.8, pitch: 1.0 }
        );
      }

      console.log('Fall detected:', fallEvent);
    } catch (error) {
      console.error('Error handling fall detection:', error);
    }
  };

  const recordFallEvent = async (
    severity: 'low' | 'medium' | 'high',
    location?: { latitude: number; longitude: number; accuracy: number },
    deviceData: any = {}
  ) => {
    const { data, error } = await supabase
      .from('fall_detection_events')
      .insert({
        user_id: userId,
        detected_at: new Date().toISOString(),
        location,
        severity,
        response_status: 'detected',
        device_data: deviceData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateEventStatus = async (
    eventId: string,
    status: 'notified' | 'responded' | 'resolved',
    responderId?: string,
    notes?: string
  ) => {
    const { data, error } = await supabase
      .from('fall_detection_events')
      .update({
        response_status: status,
        responder_id: responderId,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    
    // Update local state
    setEvents(current => 
      current.map(event => 
        event.id === eventId ? { ...event, response_status: status, notes } : event
      )
    );
    
    return data;
  };

  const markEventAsResolved = async (eventId: string) => {
    await updateEventStatus(eventId, 'resolved', userId, 'User confirmed they are OK');
  };

  const triggerTestFall = async () => {
    if (!monitoring) {
      Alert.alert('Error', 'Please start monitoring first');
      return;
    }

    const mockAcceleration = 2.5 + Math.random(); // Random high acceleration
    await handleFallDetected(mockAcceleration);
  };

  const startMonitoring = async () => {
    try {
      setMonitoring(true);
      await startDeviceMonitoring();
      
      if (Platform.OS !== 'web') {
        await Speech.speak(
          settings.mockMode ? 
            'Fall detection monitoring started in demo mode' :
            'Fall detection monitoring started',
          { rate: 0.8, pitch: 1.0 }
        );
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      setMonitoring(false);
      Alert.alert('Error', 'Failed to start fall detection monitoring');
    }
  };

  const stopMonitoring = async () => {
    try {
      setMonitoring(false);
      stopDeviceMonitoring();
      
      if (Platform.OS !== 'web') {
        await Speech.speak('Fall detection monitoring stopped', { rate: 0.8, pitch: 1.0 });
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  const setSensitivity = (sensitivity: number) => {
    setSettings(prev => ({ ...prev, sensitivity }));
  };

  const toggleMockMode = () => {
    setSettings(prev => ({ ...prev, mockMode: !prev.mockMode }));
    if (monitoring) {
      // Restart monitoring with new mode
      stopDeviceMonitoring();
      setTimeout(() => startDeviceMonitoring(), 500);
    }
  };

  return {
    events,
    monitoring,
    loading,
    settings,
    recordFallEvent,
    updateEventStatus,
    markEventAsResolved,
    startMonitoring,
    stopMonitoring,
    setSensitivity,
    toggleMockMode,
    triggerTestFall,
    recentEvents: events.slice(0, 5),
    hasActiveEvents: events.some(e => e.response_status !== 'resolved'),
    criticalEvents: events.filter(e => e.severity === 'high' && e.response_status !== 'resolved'),
    todayEvents: events.filter(e => {
      const today = new Date().toDateString();
      return new Date(e.detected_at).toDateString() === today;
    })
  };
}