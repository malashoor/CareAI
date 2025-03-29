import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    type: 'insurance_claim' | 'pharmacy_refill' | 'notification';
  };
  fontSize?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const fontSizeMap = {
  small: 14,
  medium: 16,
  large: 18,
};

export function NotificationItem({ notification, fontSize = 'medium', onPress }: NotificationItemProps) {
  const theme = useTheme();
  const textSize = fontSizeMap[fontSize];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.card },
        !notification.read && styles.unread,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={
            notification.type === 'insurance_claim'
              ? 'file-text'
              : notification.type === 'pharmacy_refill'
              ? 'pill'
              : 'bell'
          }
          size={24}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontSize: textSize },
          ]}
        >
          {notification.title}
        </Text>
        <Text
          style={[
            styles.body,
            { color: theme.colors.text, fontSize: textSize - 2 },
          ]}
        >
          {notification.body}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: theme.colors.textSecondary, fontSize: textSize - 4 },
          ]}
        >
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    marginBottom: 4,
  },
  timestamp: {
    opacity: 0.7,
  },
}); 