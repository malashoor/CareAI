import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
  I18nManager,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Speech from 'expo-speech';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { useHealthMetrics } from '../hooks/useHealthMetrics';
import { format, subDays, isSameDay } from 'date-fns';
import { logErrorToAnalytics } from '../utils/analytics';
import { theme } from '../theme';

interface ActivitySummaryProps {
  seniorId: string;
  loading?: boolean;
}

interface ActivityData {
  steps: number;
  calories: number;
  minutes: number;
  date: Date;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({ seniorId, loading = false }) => {
  const { colors } = useTheme();
  const { announce } = useVoiceFeedback();
  const { moodTrend } = useHealthMetrics();
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [last7Days] = useState(() => 
    Array.from({ length: 7 }, (_, i) => ({
      date: subDays(new Date(), i),
      label: format(subDays(new Date(), i), 'EEE')
    }))
  );

  useEffect(() => {
    if (!loading) {
      fetchActivityData(selectedDate);
    }
  }, [seniorId, loading, selectedDate]);

  useEffect(() => {
    if (moodTrend) {
      const emotionalContext = `You seem ${moodTrend} today. Here's how your activity went.`;
      announce(emotionalContext);
    }
  }, [moodTrend, announce]);

  const fetchActivityData = async (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error: fetchError } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('type', 'activity')
        .eq('senior_id', seniorId)
        .gte('timestamp', startOfDay.toISOString())
        .lte('timestamp', endOfDay.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setActivityData({
          steps: data[0].value.steps,
          calories: data[0].value.calories,
          minutes: data[0].value.minutes,
          date: new Date(data[0].timestamp)
        });
        setError(null);
      } else {
        setActivityData(null);
        setError('No activity data available for this day');
      }
    } catch (err) {
      logErrorToAnalytics('ActivitySummaryFetchError', {
        error: err,
        seniorId,
        date: date.toISOString()
      });
      setError('Failed to load activity data');
      announce('Failed to load activity data');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivityData(selectedDate);
    setRefreshing(false);
  }, [selectedDate]);

  const handleSpeak = () => {
    if (!activityData) return;

    const dateStr = format(activityData.date, 'EEEE');
    const text = `${dateStr}'s activity summary: ${activityData.steps} steps taken, ${activityData.calories} calories burned, and ${activityData.minutes} minutes of activity.`;

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const renderDayButton = ({ item }: { item: { date: Date; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        isSameDay(item.date, selectedDate) && styles.selectedDayButton
      ]}
      onPress={() => setSelectedDate(item.date)}
      accessibilityLabel={`View activity for ${format(item.date, 'EEEE')}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSameDay(item.date, selectedDate) }}
    >
      <Text
        style={[
          styles.dayButtonText,
          isSameDay(item.date, selectedDate) && styles.selectedDayButtonText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator 
          size="large" 
          color={colors.primary}
          testID="activity-loading"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle" 
            size={48} 
            color={colors.error}
            testID="activity-error-icon"
          />
          <Text 
            style={[styles.errorText, { color: colors.text }]}
            testID="activity-error-message"
          >
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.card }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          testID="activity-refresh-control"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="fitness" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Activity Summary</Text>
        </View>
        <Ionicons
          name={isSpeaking ? "volume-mute" : "volume-high"}
          size={24}
          color={colors.primary}
          onPress={handleSpeak}
          style={styles.speakerIcon}
          accessibilityLabel={isSpeaking ? "Stop speaking activity summary" : "Speak activity summary"}
          accessibilityRole="button"
          testID="activity-speaker-button"
        />
      </View>

      <FlatList
        horizontal
        data={last7Days}
        renderItem={renderDayButton}
        keyExtractor={(item) => item.date.toISOString()}
        showsHorizontalScrollIndicator={false}
        style={styles.daysList}
        testID="activity-days-list"
      />

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Ionicons name="footsteps" size={32} color={colors.primary} />
          <Text 
            style={[styles.metricValue, { color: colors.text }]}
            testID="activity-steps-value"
          >
            {activityData?.steps || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Steps</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="flame" size={32} color={colors.primary} />
          <Text 
            style={[styles.metricValue, { color: colors.text }]}
            testID="activity-calories-value"
          >
            {activityData?.calories || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Calories</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="time" size={32} color={colors.primary} />
          <Text 
            style={[styles.metricValue, { color: colors.text }]}
            testID="activity-minutes-value"
          >
            {activityData?.minutes || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Minutes</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dayButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dayButtonText: {
    color: theme.colors.text.secondary,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  daysList: {
    marginBottom: theme.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginTop: theme.spacing.xs,
    opacity: 0.8,
  },
  metricValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginTop: theme.spacing.sm,
  },
  metricsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  selectedDayButton: {
    backgroundColor: theme.colors.primary,
  },
  selectedDayButtonText: {
    color: theme.colors.white,
    fontFamily: 'Poppins-Medium',
  },
  speakerIcon: {
    padding: theme.spacing.xs,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    marginLeft: theme.spacing.sm,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
}); 