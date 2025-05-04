import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [permission, setPermission] = useState<Notifications.NotificationPermissionsStatus>();

  const requestPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermission(finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const scheduleNotification = useCallback(async (
    title: string,
    body: string,
    trigger: { seconds: number }
  ) => {
    try {
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Configure Android channel if needed
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: 4, // HIGH
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          badge: 1,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }, [permission]);

  useEffect(() => {
    requestPermissions();

    // Set up notification received listener
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Set up notification response listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [requestPermissions]);

  return {
    permission,
    requestPermissions,
    scheduleNotification,
  };
} 