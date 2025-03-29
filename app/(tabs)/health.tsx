import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Activity, Droplets } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function HealthScreen() {
  const speakText = (text: string) => {
    Speech.speak(text, {
      rate: 0.8,
      pitch: 1.0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text 
          style={styles.title}
          onPress={() => speakText("Health Monitoring")}>
          Health Monitoring
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText("Your heart rate is 72 beats per minute")}>
          <Heart color="#FF2D55" size={32} />
          <Text style={styles.statValue}>72</Text>
          <Text style={styles.statLabel}>Heart Rate</Text>
          <Text style={styles.statUnit}>bpm</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText("You've taken 1,243 steps today")}>
          <Activity color="#34C759" size={32} />
          <Text style={styles.statValue}>1,243</Text>
          <Text style={styles.statLabel}>Steps</Text>
          <Text style={styles.statUnit}>today</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText("You've had 4 glasses of water")}>
          <Droplets color="#007AFF" size={32} />
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Water</Text>
          <Text style={styles.statUnit}>glasses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text 
          style={styles.sectionTitle}
          onPress={() => speakText("Today's Health Summary")}>
          Today's Health Summary
        </Text>
        <TouchableOpacity 
          style={styles.summaryCard}
          onPress={() => speakText("Your vital signs are within normal range. Keep up with your medication schedule and try to reach your daily step goal.")}>
          <Text style={styles.summaryText}>
            Your vital signs are within normal range. Keep up with your medication schedule and try to reach your daily step goal.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text 
          style={styles.sectionTitle}
          onPress={() => speakText("Medication Adherence")}>
          Medication Adherence
        </Text>
        <TouchableOpacity 
          style={styles.adherenceCard}
          onPress={() => speakText("Morning medications taken at 9:00 AM")}>
          <View style={styles.adherenceHeader}>
            <Text style={styles.adherenceTitle}>Morning Medications</Text>
            <View style={[styles.adherenceStatus, styles.statusComplete]}>
              <Text style={styles.statusText}>Taken</Text>
            </View>
          </View>
          <Text style={styles.adherenceTime}>9:00 AM</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.adherenceCard}
          onPress={() => speakText("Evening medications pending at 7:00 PM")}>
          <View style={styles.adherenceHeader}>
            <Text style={styles.adherenceTitle}>Evening Medications</Text>
            <View style={[styles.adherenceStatus, styles.statusPending]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
          <Text style={styles.adherenceTime}>7:00 PM</Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginHorizontal: 6,
    minHeight: 160,
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 8,
  },
  statUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    minHeight: 100,
  },
  summaryText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    lineHeight: 28,
  },
  adherenceCard: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 100,
  },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adherenceTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  adherenceStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusComplete: {
    backgroundColor: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  adherenceTime: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
});