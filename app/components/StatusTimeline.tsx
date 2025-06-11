import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export interface TimelineEvent {
  status: string;
  date: Date;
  notes?: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

export default function StatusTimeline({ events, currentStatus }: StatusTimelineProps) {
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      pending: theme.colors.status.warning,
      approved: theme.colors.status.success,
      rejected: theme.colors.status.error,
      filled: theme.colors.status.info,
    };
    return statusColors[status] || theme.colors.text.secondary;
  };

  const getStatusIcon = (status: string): string => {
    const statusIcons: Record<string, string> = {
      pending: 'time',
      approved: 'checkmark-circle',
      rejected: 'close-circle',
      filled: 'medical',
    };
    return statusIcons[status] || 'ellipsis-horizontal';
  };

  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineLine}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: getStatusColor(event.status) },
              ]}
            />
            {index < events.length - 1 && (
              <View
                style={[
                  styles.timelineConnector,
                  { backgroundColor: theme.colors.text.secondary },
                ]}
              />
            )}
          </View>
          <View style={styles.timelineContent}>
            <View style={styles.timelineHeader}>
              <Ionicons
                name={getStatusIcon(event.status)}
                size={20}
                color={getStatusColor(event.status)}
              />
              <Text style={styles.statusText as TextStyle}>{event.status}</Text>
            </View>
            <Text style={styles.dateText as TextStyle}>
              {event.date.toLocaleDateString()}
            </Text>
            {event.notes && (
              <Text style={styles.notesText as TextStyle}>{event.notes}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  } as ViewStyle,
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  } as ViewStyle,
  timelineLine: {
    alignItems: 'center',
    marginRight: 16,
  } as ViewStyle,
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  } as ViewStyle,
  timelineConnector: {
    width: 2,
    height: 40,
    marginTop: -12,
  } as ViewStyle,
  timelineContent: {
    flex: 1,
  } as ViewStyle,
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,
  statusText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginLeft: 8,
    textTransform: 'capitalize',
  } as TextStyle,
  dateText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  notesText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  } as TextStyle,
}); 