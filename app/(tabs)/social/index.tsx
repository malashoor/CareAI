import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  Calendar,
  MapPin,
  Video,
  Plus,
  ChevronRight,
  Volume2 as VolumeUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { useSocialActivities } from '@/hooks/useSocialActivities';

export default function SocialScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activities, myActivities, recommendedActivities } = useSocialActivities(user?.id!);
  const [selectedType, setSelectedType] = useState<string>('all');

  const speakDescription = (text: string) => {
    if (Platform.OS !== 'web') {
      Speech.speak(text, { rate: 0.8, pitch: 1.0 });
    }
  };

  const activityTypes = [
    { id: 'all', name: 'All Activities' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'book_club', name: 'Book Club' },
    { id: 'hobby', name: 'Hobbies' },
    { id: 'support_group', name: 'Support Groups' },
    { id: 'game', name: 'Games' },
  ];

  const filteredActivities = activities.filter(
    activity => selectedType === 'all' || activity.type === selectedType
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Activities</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/social/create')}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.createGradient}>
            <Plus color="#FFF" size={24} />
            <Text style={styles.createText}>Create Activity</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedList}>
          {recommendedActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.recommendedCard}
              onPress={() => router.push(`/social/activity?id=${activity.id}`)}>
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
                      key={participant.id}
                      source={{ uri: participant.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop' }}
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

      <View style={styles.myActivitiesSection}>
        <Text style={styles.sectionTitle}>My Activities</Text>
        {myActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => router.push(`/social/activity?id=${activity.id}`)}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.activityDetails}>
                <View style={styles.detailRow}>
                  <Calendar color="#666666" size={16} />
                  <Text style={styles.detailText}>
                    {new Date(activity.start_time).toLocaleDateString()}
                  </Text>
                </View>
                {activity.location ? (
                  <View style={styles.detailRow}>
                    <MapPin color="#666666" size={16} />
                    <Text style={styles.detailText}>{activity.location.name}</Text>
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <Video color="#666666" size={16} />
                    <Text style={styles.detailText}>Virtual Meeting</Text>
                  </View>
                )}
              </View>
            </View>
            <ChevronRight color="#666666" size={24} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
            {activityTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedType === type.id && styles.typeSelected
                ]}
                onPress={() => setSelectedType(type.id)}>
                <Text style={[
                  styles.typeText,
                  selectedType === type.id && styles.typeTextSelected
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => router.push(`/social/activity?id=${activity.id}`)}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <TouchableOpacity
                onPress={() => speakDescription(activity.description || '')}
                style={styles.speakButton}>
                <VolumeUp color="#007AFF" size={20} />
              </TouchableOpacity>
              <View style={styles.activityDetails}>
                <View style={styles.detailRow}>
                  <Calendar color="#666666" size={16} />
                  <Text style={styles.detailText}>
                    {new Date(activity.start_time).toLocaleDateString()}
                  </Text>
                </View>
                {activity.location ? (
                  <View style={styles.detailRow}>
                    <MapPin color="#666666" size={16} />
                    <Text style={styles.detailText}>{activity.location.name}</Text>
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <Video color="#666666" size={16} />
                    <Text style={styles.detailText}>Virtual Meeting</Text>
                  </View>
                )}
              </View>
              <View style={styles.participantsRow}>
                <Users color="#666666" size={16} />
                <Text style={styles.participantsText}>
                  {activity.participants?.length || 0} participants
                </Text>
              </View>
            </View>
            <ChevronRight color="#666666" size={24} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recommendedSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  recommendedList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendedCard: {
    width: 280,
    height: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
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
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 8,
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
    marginTop: 16,
  },
  upcomingSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  typeFilters: {
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  typeSelected: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  speakButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  activityDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
});