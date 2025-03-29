import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Brain,
  Trophy,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Volume2 as VolumeUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { useCognitiveExercises } from '@/hooks/useCognitiveExercises';

export default function CognitiveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { exercises, progress, getRecommendedExercises, averageScore } = useCognitiveExercises(user?.id!);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const speakInstructions = (text: string) => {
    if (Platform.OS !== 'web') {
      Speech.speak(text, { rate: 0.8, pitch: 1.0 });
    }
  };

  const categories = [
    { id: 'all', name: 'All Exercises' },
    { id: 'memory', name: 'Memory' },
    { id: 'attention', name: 'Attention' },
    { id: 'problem_solving', name: 'Problem Solving' },
    { id: 'language', name: 'Language' },
    { id: 'visual', name: 'Visual' },
  ];

  const filteredExercises = exercises.filter(
    ex => selectedCategory === 'all' || ex.type === selectedCategory
  );

  const recommendedExercises = getRecommendedExercises();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cognitive Training</Text>
        <TouchableOpacity
          onPress={() => speakInstructions('Welcome to your cognitive training dashboard. Here you can find exercises to keep your mind sharp and track your progress.')}>
          <VolumeUp color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Trophy color="#FFD700" size={32} />
          <Text style={styles.statValue}>{Math.round(averageScore)}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp color="#34C759" size={32} />
          <Text style={styles.statValue}>{progress.length}</Text>
          <Text style={styles.statLabel}>Exercises Done</Text>
        </View>

        <View style={styles.statCard}>
          <Star color="#FF9500" size={32} />
          <Text style={styles.statValue}>{progress.filter(p => p.score >= 80).length}</Text>
          <Text style={styles.statLabel}>Excellence</Text>
        </View>
      </View>

      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedList}>
          {recommendedExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.recommendedCard}
              onPress={() => router.push(`/cognitive/exercise?id=${exercise.id}`)}>
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                style={styles.recommendedGradient}>
                <Brain color="#FFF" size={32} />
                <Text style={styles.recommendedTitle}>{exercise.title}</Text>
                <View style={styles.recommendedInfo}>
                  <Clock color="#FFF" size={16} />
                  <Text style={styles.recommendedDuration}>
                    {exercise.duration_minutes} min
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categorySelected
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.exercisesList}>
        {filteredExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => router.push(`/cognitive/exercise?id=${exercise.id}`)}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseType}>{exercise.type}</Text>
              <View style={styles.exerciseDetails}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                </View>
                <Text style={styles.duration}>{exercise.duration_minutes} min</Text>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 8,
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
    marginTop: 16,
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
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recommendedGradient: {
    padding: 20,
    height: 160,
  },
  recommendedTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  recommendedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recommendedDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  categories: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  categorySelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  exercisesList: {
    padding: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});