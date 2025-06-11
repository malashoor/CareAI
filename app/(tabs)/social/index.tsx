import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Volume2 as VolumeUp
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSocialActivities } from '../../../hooks/useSocialActivities';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export default function SocialScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const {
    activities,
    myActivities,
    recommendedActivities,
    loading,
    joinActivity,
    leaveActivity,
    createActivity
  } = useSocialActivities(user?.id!);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [joiningActivity, setJoiningActivity] = useState<string | null>(null);

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const speakDescription = (activity: any) => {
    const description = `${activity.title}. ${activity.description || 'Activity scheduled for'}. Starting ${new Date(activity.start_time).toLocaleDateString()} at ${new Date(activity.start_time).toLocaleTimeString()}. ${activity.participants?.length || 0} participants joined.`;
    speakText(description);
  };

  const activityTypes = [
    { id: 'all', name: 'All Activities', emoji: '🎯' },
    { id: 'fitness', name: 'Fitness', emoji: '💪' },
    { id: 'book_club', name: 'Book Club', emoji: '📚' },
    { id: 'hobby', name: 'Hobbies', emoji: '🎨' },
    { id: 'support_group', name: 'Support Groups', emoji: '🤝' },
    { id: 'game', name: 'Games', emoji: '🎮' },
  ];

  const filteredActivities = activities.filter(
    activity => selectedType === 'all' || activity.type === selectedType
  );

  const isUserParticipant = (activity: any): boolean => {
    return activity.participants?.some((p: any) => p.user?.id === user?.id) || false;
  };

  const handleJoinActivity = async (activityId: string, activityTitle: string) => {
    try {
      setJoiningActivity(activityId);
      await joinActivity(activityId);
      await speakText(`Successfully joined ${activityTitle}!`);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error joining activity:', error);
      Alert.alert('Error', 'Failed to join activity. Please try again.');
    } finally {
      setJoiningActivity(null);
    }
  };

  const handleLeaveActivity = async (activityId: string, activityTitle: string) => {
    Alert.alert(
      'Leave Activity',
      `Are you sure you want to leave "${activityTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setJoiningActivity(activityId);
              await leaveActivity(activityId);
              await speakText(`Left ${activityTitle}`);
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              console.error('Error leaving activity:', error);
              Alert.alert('Error', 'Failed to leave activity. Please try again.');
            } finally {
              setJoiningActivity(null);
            }
          }
        }
      ]
    );
  };

  const handleCreateActivity = () => {
    // Check if the route exists, otherwise show a creation modal
    Alert.alert(
      'Create New Activity',
      'Would you like to create a new social activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quick Create', onPress: () => handleQuickCreate() },
        { text: 'Advanced', onPress: () => navigateToCreate() }
      ]
    );
  };

  const navigateToCreate = () => {
    try {
      router.push('/social/create');
    } catch (error) {
      // Route doesn't exist, show fallback
      Alert.alert(
        'Coming Soon',
        'Advanced activity creation is coming soon. Use Quick Create for now.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleQuickCreate = () => {
    const quickActivities = [
      {
        title: 'Morning Walk Group',
        description: 'Join us for a refreshing morning walk in the park',
        type: 'fitness' as const,
        start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(), // +1 hour
        location: { name: 'Central Park', address: '123 Park Ave' }
      },
      {
        title: 'Book Discussion',
        description: 'Monthly book club meeting to discuss our latest read',
        type: 'book_club' as const,
        start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        end_time: new Date(Date.now() + 172800000 + 7200000).toISOString(), // +2 hours
        virtual_meeting_link: 'https://meet.example.com/book-club'
      },
      {
        title: 'Art & Craft Session',
        description: 'Creative time with painting and crafts',
        type: 'hobby' as const,
        start_time: new Date(Date.now() + 259200000).toISOString(), // 3 days
        end_time: new Date(Date.now() + 259200000 + 5400000).toISOString(), // +1.5 hours
        location: { name: 'Community Center', address: '456 Main St' }
      }
    ];

    Alert.alert(
      'Quick Create Activity',
      'Choose from these popular activity types:',
      [
        { text: 'Cancel', style: 'cancel' },
        ...quickActivities.map((activity, index) => ({
          text: activity.title,
          onPress: () => createQuickActivity(activity)
        }))
      ]
    );
  };

  const createQuickActivity = async (activityData: any) => {
    try {
      await createActivity(activityData);
      await speakText(`Activity "${activityData.title}" created successfully!`);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', 'Failed to create activity. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await speakText('Refreshing social activities');
    // The hook will automatically refresh due to real-time subscriptions
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFilterChange = async (typeId: string) => {
    setSelectedType(typeId);
    const selectedFilter = activityTypes.find(t => t.id === typeId);
    await speakText(`Filtering by ${selectedFilter?.name || 'all activities'}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading social activities...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isRTL && styles.rtlContainer]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <Text style={[styles.title, isRTL && styles.rtlText]}>Social Activities</Text>
          <TouchableOpacity
            onPress={() => speakText('Social Activities. Connect with others through various group activities and events. Join existing activities or create your own.')}
            style={styles.voiceButton}
            accessibilityRole="button"
            accessibilityLabel="Listen to page description">
            <VolumeUp color="#007AFF" size={20} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateActivity}
          accessibilityRole="button"
          accessibilityLabel="Create new activity">
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.createGradient}>
            <Plus color="#FFF" size={24} />
            <Text style={styles.createText}>Create Activity</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activities.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myActivities.length}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{recommendedActivities.length}</Text>
          <Text style={styles.statLabel}>Recommended</Text>
        </View>
      </View>

      {/* Recommended Activities */}
      {recommendedActivities.length > 0 && (
        <View style={styles.recommendedSection}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>🌟 Recommended for You</Text>
            <TouchableOpacity
              onPress={() => speakText('Recommended activities based on your interests and schedule')}
              style={styles.sectionVoiceButton}
              accessibilityRole="button"
              accessibilityLabel="Listen to section description">
              <VolumeUp color="#007AFF" size={16} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedList}>
            {recommendedActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.recommendedCard}
                onPress={() => router.push(`/social/activity?id=${activity.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Recommended activity: ${activity.title}`}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?q=80&w=300&auto=format&fit=crop' }}
                  style={styles.recommendedImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.recommendedOverlay}>
                  <Text style={styles.recommendedTitle}>{activity.title}</Text>
                  <View style={styles.recommendedInfo}>
                    <Calendar color="#FFF" size={16} />
                    <Text style={styles.recommendedTime}>
                      {new Date(activity.start_time).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.participantsPreview}>
                    {activity.participants?.slice(0, 3).map((participant, index) => (
                      <Image
                        key={participant.user?.id || index}
                        source={{ uri: participant.user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop' }}
                        style={[
                          styles.participantAvatar,
                          { marginLeft: index > 0 ? -10 : 0 }
                        ]}
                      />
                    ))}
                    {activity.participants && activity.participants.length > 3 && (
                      <View style={styles.moreParticipants}>
                        <Text style={styles.moreParticipantsText}>
                          +{activity.participants.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* My Activities */}
      {myActivities.length > 0 && (
        <View style={styles.myActivitiesSection}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>👤 My Activities</Text>
            <TouchableOpacity
              onPress={() => speakText('Activities you have joined or created')}
              style={styles.sectionVoiceButton}
              accessibilityRole="button"
              accessibilityLabel="Listen to section description">
              <VolumeUp color="#007AFF" size={16} />
            </TouchableOpacity>
          </View>
          
          {myActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => router.push(`/social/activity?id=${activity.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Your activity: ${activity.title}`}>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, isRTL && styles.rtlText]}>{activity.title}</Text>
                <View style={styles.activityDetails}>
                  <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                    <Calendar color="#666666" size={16} />
                    <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                      {new Date(activity.start_time).toLocaleDateString()}
                    </Text>
                  </View>
                  {activity.location ? (
                    <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                      <MapPin color="#666666" size={16} />
                      <Text style={[styles.detailText, isRTL && styles.rtlText]}>{activity.location.name}</Text>
                    </View>
                  ) : (
                    <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                      <Video color="#666666" size={16} />
                      <Text style={[styles.detailText, isRTL && styles.rtlText]}>Virtual Meeting</Text>
                    </View>
                  )}
                </View>
              </View>
              <ChevronRight color="#666666" size={24} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Activity Filters and Upcoming */}
      <View style={styles.upcomingSection}>
        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>🗓️ Upcoming Activities</Text>
          <TouchableOpacity
            onPress={() => speakText(`Showing ${filteredActivities.length} activities. Use filters to narrow down by category.`)}
            style={styles.sectionVoiceButton}
            accessibilityRole="button"
            accessibilityLabel="Listen to activity count">
            <TrendingUp color="#007AFF" size={16} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.typeFilters}
          contentContainerStyle={styles.typeFiltersContent}>
          {activityTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && styles.typeSelected
              ]}
              onPress={() => handleFilterChange(type.id)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${type.name}`}>
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.typeText,
                selectedType === type.id && styles.typeTextSelected,
                isRTL && styles.rtlText
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#CCCCCC" size={48} />
            <Text style={[styles.emptyStateText, isRTL && styles.rtlText]}>
              No activities found for this category
            </Text>
            <TouchableOpacity
              style={styles.createEmptyButton}
              onPress={handleCreateActivity}
              accessibilityRole="button"
              accessibilityLabel="Create the first activity">
              <Text style={styles.createEmptyText}>Create the first one!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredActivities.map((activity) => {
            const isParticipant = isUserParticipant(activity);
            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                onPress={() => router.push(`/social/activity?id=${activity.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Activity: ${activity.title}`}>
                <View style={styles.activityInfo}>
                  <View style={[styles.activityHeader, isRTL && styles.activityHeaderRTL]}>
                    <Text style={[styles.activityTitle, isRTL && styles.rtlText]}>{activity.title}</Text>
                    <TouchableOpacity
                      onPress={() => speakDescription(activity)}
                      style={styles.speakButton}
                      accessibilityRole="button"
                      accessibilityLabel="Listen to activity details">
                      <VolumeUp color="#007AFF" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activityDetails}>
                    <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                      <Clock color="#666666" size={16} />
                      <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                        {new Date(activity.start_time).toLocaleDateString()} at {new Date(activity.start_time).toLocaleTimeString()}
                      </Text>
                    </View>
                    {activity.location ? (
                      <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                        <MapPin color="#666666" size={16} />
                        <Text style={[styles.detailText, isRTL && styles.rtlText]}>{activity.location.name}</Text>
                      </View>
                    ) : (
                      <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                        <Video color="#666666" size={16} />
                        <Text style={[styles.detailText, isRTL && styles.rtlText]}>Virtual Meeting</Text>
                      </View>
                    )}
                    <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                      <Users color="#666666" size={16} />
                      <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                        {activity.participants?.length || 0} participants
                        {activity.max_participants && ` / ${activity.max_participants} max`}
                      </Text>
                    </View>
                  </View>

                  {/* RSVP/Join Button */}
                  <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                    {isParticipant ? (
                      <TouchableOpacity
                        style={styles.joinedButton}
                        onPress={() => handleLeaveActivity(activity.id, activity.title)}
                        disabled={joiningActivity === activity.id}
                        accessibilityRole="button"
                        accessibilityLabel="Leave activity">
                        {joiningActivity === activity.id ? (
                          <ActivityIndicator size="small" color="#34C759" />
                        ) : (
                          <UserCheck color="#34C759" size={20} />
                        )}
                        <Text style={styles.joinedButtonText}>Joined</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => handleJoinActivity(activity.id, activity.title)}
                        disabled={joiningActivity === activity.id}
                        accessibilityRole="button"
                        accessibilityLabel="Join activity">
                        {joiningActivity === activity.id ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <UserPlus color="#007AFF" size={20} />
                        )}
                        <Text style={styles.joinButtonText}>Join</Text>
                      </TouchableOpacity>
                    )}
                    <ChevronRight color="#666666" size={24} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  rtlContainer: {
    direction: 'rtl',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerRTL: {
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  rtlText: {
    textAlign: 'right',
  },
  voiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  createText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  recommendedSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  sectionVoiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  recommendedList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendedCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  participantsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  moreParticipantsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  myActivitiesSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  upcomingSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  typeFilters: {
    marginBottom: 16,
  },
  typeFiltersContent: {
    paddingRight: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  typeSelected: {
    backgroundColor: '#007AFF',
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
  },
  createEmptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  createEmptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  activityCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  activityTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  speakButton: {
    padding: 8,
  },
  activityDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRowRTL: {
    flexDirection: 'row-reverse',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  joinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F7E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  joinedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#34C759',
  },
});