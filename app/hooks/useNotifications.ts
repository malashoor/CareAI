import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'refill_status_update' | 'claim_status_update' | 'payment_reminder' | 'prescription_expiry' | 'insurance_renewal' | 'medication_interaction';
    refillId?: string;
    claimId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Date;
  type: 'insurance_claim' | 'pharmacy_refill' | 'notification';
}

export function useNotifications() {
  const [permission, setPermission] = useState<Notifications.PermissionStatus>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(
        data.map((notification) => ({
          ...notification,
          read: notification.read || false,
          createdAt: new Date(notification.created_at),
        }))
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    registerForPushNotifications();
    setupNotificationHandler();
    fetchNotifications();
  }, [user]);

  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermission(finalStatus);

      if (finalStatus !== 'granted') {
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      if (user) {
        await supabase
          .from('user_push_tokens')
          .upsert({
            user_id: user.id,
            token: token.data,
            platform: Platform.OS,
          });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const setupNotificationHandler = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const subscription = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        const newNotification: Notification = {
          id: notification.request.identifier,
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          read: false,
          createdAt: new Date(),
          type: notification.request.content.data?.type || 'notification',
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
    );

    return () => subscription.remove();
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      setNotifications([]);
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return {
    notifications,
    permission,
    isLoading,
    markAsRead,
    clearAllNotifications,
    refetch: fetchNotifications,
  };
} 