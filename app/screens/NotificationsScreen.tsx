import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '@/theme';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const { notifications, markAsRead, clearAllNotifications, permission } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add any refresh logic here
    setRefreshing(false);
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Handle navigation based on notification type
    if (notification.data?.type === 'refill_status_update') {
      navigation.navigate('RefillDetails', { refillId: notification.data.refillId });
    } else if (notification.data?.type === 'claim_status_update') {
      navigation.navigate('ClaimDetails', { claimId: notification.data.claimId });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      accessibilityLabel={`${item.title}: ${item.body}`}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={item.read ? 'notifications-off' : 'notifications'}
          size={24}
          color={item.read ? theme.colors.text.secondary : theme.colors.primary.default}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle as TextStyle}>{item.title}</Text>
        <Text style={styles.notificationBody as TextStyle}>{item.body}</Text>
        <Text style={styles.notificationTime as TextStyle}>
          {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off" size={48} color={theme.colors.text.secondary} />
      <Text style={styles.emptyStateText as TextStyle}>No notifications yet</Text>
      {permission !== 'granted' && (
        <Text style={styles.permissionText as TextStyle}>
          Enable notifications to receive updates about your refills and claims
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title as TextStyle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={clearAllNotifications}
            style={styles.clearButton}
            accessibilityLabel="Clear all notifications"
          >
            <Text style={styles.clearButtonText as TextStyle}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
  } as TextStyle,
  clearButton: {
    padding: 8,
  } as ViewStyle,
  clearButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.primary.default,
  } as TextStyle,
  listContent: {
    flexGrow: 1,
  } as ViewStyle,
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  unreadNotification: {
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  notificationIcon: {
    marginRight: 16,
    justifyContent: 'center',
  } as ViewStyle,
  notificationContent: {
    flex: 1,
  } as ViewStyle,
  notificationTitle: {
    fontSize: 16,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,
  notificationBody: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  notificationTime: {
    fontSize: 12,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  } as TextStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  emptyStateText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.secondary,
    marginTop: 16,
  } as TextStyle,
  permissionText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  } as TextStyle,
}); 