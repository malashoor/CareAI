declare module 'expo-notifications' {
  export interface Notification {
    request: {
      identifier: string;
      content: {
        title?: string;
        body?: string;
        data?: any;
      };
    };
  }

  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
  }

  export interface NotificationHandler {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }

  export interface PermissionResponse {
    status: PermissionStatus;
  }

  export enum PermissionStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    UNDETERMINED = 'undetermined',
  }

  export interface PushToken {
    data: string;
    type: 'expo' | 'fcm';
  }

  export function getPermissionsAsync(): Promise<PermissionResponse>;
  export function requestPermissionsAsync(): Promise<PermissionResponse>;
  export function getExpoPushTokenAsync(): Promise<PushToken>;
  export function setNotificationHandler(handler: NotificationHandler): void;
  export function addNotificationReceivedListener(
    listener: (notification: Notification) => void
  ): { remove: () => void };
  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): { remove: () => void };
  export function setBadgeCountAsync(count: number): Promise<void>;
  export function getBadgeCountAsync(): Promise<number>;
} 