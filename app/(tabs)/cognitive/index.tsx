import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Brain,
  Trophy,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Volume2 as VolumeUp,
  BarChart3,
  Target,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useCognitiveExercises } from '@/hooks/useCognitiveExercises';
import { useLanguage } from '@/hooks/useLanguage';

const { width: screenWidth } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export default function CognitiveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { 
    exercises, 
    progress, 
    loading, 
    getRecommendedExercises, 
    averageScore,
    recentProgress 
  } = useCognitiveExercises(user?.id || '');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, { 
          rate: 0.8, 
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const categories = [
    { id: 'all', name: 'All Exercises', icon: Brain },
    { id: 'memory', name: 'Memory', icon: Brain },
    { id: 'attention', name: 'Attention', icon: Target },
    { id: 'problem_solving', name: 'Problem Solving', icon: Zap },
    { id: 'language', name: 'Language', icon: Star },
    { id: 'visual', name: 'Visual', icon: Award },
  ];

  const filteredExercises = exercises.filter(
    ex => selectedCategory === 'all' || ex.type === selectedCategory
  );

  const recommendedExercises = getRecommendedExercises();

  // Calculate category-specific stats
  const getCategoryStats = () => {
    const categoryProgress = progress.reduce((acc, p) => {
      const exercise = exercises.find(e => e.id === p.exercise_id);
      if (!exercise) return acc;

      if (!acc[exercise.type]) {
        acc[exercise.type] = { total: 0, count: 0, best: 0 };
      }
      acc[exercise.type].total += p.score;
      acc[exercise.type].count += 1;
      acc[exercise.type].best = Math.max(acc[exercise.type].best, p.score);
      return acc;
    }, {} as Record<string, { total: number; count: number; best: number }>);

    return categoryProgress;
  };

  const categoryStats = getCategoryStats();

  // Calculate achievements
  const calculateAchievements = (): Achievement[] => {
    const totalExercises = progress.length;
    const excellentScores = progress.filter(p => p.score >= 80).length;
    const perfectScores = progress.filter(p => p.score === 100).length;
    const streakData = calculateStreak();

    return [
      {
        id: 'first_exercise',
        title: 'Getting Started',
        description: 'Complete your first exercise',
        icon: Star,
        color: '#34C759',
        unlocked: totalExercises >= 1,
        progress: Math.min(totalExercises, 1),
        target: 1
      },
      {
        id: 'ten_exercises',
        title: 'Dedicated Learner',
        description: 'Complete 10 exercises',
        icon: Trophy,
        color: '#FF9500',
        unlocked: totalExercises >= 10,
        progress: Math.min(totalExercises, 10),
        target: 10
      },
      {
        id: 'excellent_performer',
        title: 'Excellence',
        description: 'Score 80% or higher on 5 exercises',
        icon: Award,
        color: '#FFD700',
        unlocked: excellentScores >= 5,
        progress: Math.min(excellentScores, 5),
        target: 5
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Achieve a perfect score',
        icon: Star,
        color: '#AF52DE',
        unlocked: perfectScores >= 1,
        progress: Math.min(perfectScores, 1),
        target: 1
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 7-day streak',
        icon: Zap,
        color: '#FF6B6B',
        unlocked: streakData.currentStreak >= 7,
        progress: Math.min(streakData.currentStreak, 7),
        target: 7
      }
    ];
  };

  const calculateStreak = () => {
    if (progress.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = progress.map(p => new Date(p.created_at).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i]);
      const previous = new Date(uniqueDates[i - 1]);
      const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate current streak from today backwards
    const today = new Date().toDateString();
    if (uniqueDates.includes(today)) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const current = new Date(uniqueDates[i + 1]);
        const previous = new Date(uniqueDates[i]);
        const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  };

  // Generate chart data
  const getChartData = () => {
    if (recentProgress.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    const last7Days = recentProgress.slice(0, 7).reverse();
    const labels = last7Days.map((_, index) => `Day ${index + 1}`);
    const data = last7Days.map(p => p.score);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const achievements = calculateAchievements();
  const streakData = calculateStreak();

  const handleCategoryPress = async (category: any) => {
    setSelectedCategory(category.id);
    await speakText(`Showing ${category.name} exercises`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleExercisePress = async (exercise: any) => {
    await speakText(`Starting ${exercise.title}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/cognitive/exercise?id=${exercise.id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await speakText('Refreshing cognitive training data');
    // The hook automatically handles real-time updates, so we just need to indicate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your cognitive training...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>Cognitive Training</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => speakText('Welcome to your cognitive training dashboard. Here you can find exercises to keep your mind sharp and track your progress.')}
            style={styles.voiceButton}
            accessibilityRole="button"
            accessibilityLabel="Listen to instructions">
            <VolumeUp color="#007AFF" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            accessibilityRole="button"
            accessibilityLabel="Refresh data">
            <RefreshCw 
              color="#007AFF" 
              size={24} 
              style={refreshing ? styles.spinning : undefined} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText(`Your average score is ${Math.round(averageScore)} percent`)}>
          <Trophy color="#FFD700" size={32} />
          <Text style={styles.statValue}>{Math.round(averageScore)}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText(`You have completed ${progress.length} exercises`)}>
          <TrendingUp color="#34C759" size={32} />
          <Text style={styles.statValue}>{progress.length}</Text>
          <Text style={styles.statLabel}>Exercises Done</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText(`You have ${progress.filter(p => p.score >= 80).length} excellent scores`)}>
          <Star color="#FF9500" size={32} />
          <Text style={styles.statValue}>{progress.filter(p => p.score >= 80).length}</Text>
          <Text style={styles.statLabel}>Excellence</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => speakText(`Your current streak is ${streakData.currentStreak} days`)}>
          <Zap color="#FF6B6B" size={32} />
          <Text style={styles.statValue}>{streakData.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Progress Trend</Text>
          <TouchableOpacity
            onPress={() => setShowProgressChart(!showProgressChart)}
            style={styles.chartToggle}
            accessibilityRole="button"
            accessibilityLabel={showProgressChart ? 'Hide chart' : 'Show chart'}>
            <BarChart3 color="#007AFF" size={20} />
          </TouchableOpacity>
        </View>
        
        {showProgressChart && (
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData()}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#007AFF'
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementCard, achievement.unlocked && styles.achievementUnlocked]}
              onPress={() => speakText(`${achievement.title}: ${achievement.description}. ${achievement.unlocked ? 'Completed' : 'In progress'}`)}
              accessibilityRole="button"
              accessibilityLabel={`${achievement.title}: ${achievement.description}`}>
              <achievement.icon 
                color={achievement.unlocked ? achievement.color : '#CCCCCC'} 
                size={32} 
              />
              <Text style={[
                styles.achievementTitle,
                achievement.unlocked && { color: achievement.color }
              ]}>
                {achievement.title}
              </Text>
              {achievement.target && (
                <Text style={styles.achievementProgress}>
                  {achievement.progress}/{achievement.target}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Exercises */}
      {recommendedExercises.length > 0 && (
        <View style={styles.recommendedSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedList}>
            {recommendedExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.recommendedCard}
                onPress={() => handleExercisePress(exercise)}
                accessibilityRole="button"
                accessibilityLabel={`${exercise.title}, ${exercise.duration_minutes} minutes`}>
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
      )}

      {/* Category Filters */}
      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => {
            const categoryData = categoryStats[category.id];
            const averageForCategory = categoryData 
              ? Math.round(categoryData.total / categoryData.count) 
              : 0;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categorySelected
                ]}
                onPress={() => handleCategoryPress(category)}
                accessibilityRole="button"
                accessibilityLabel={`${category.name} category${categoryData ? `, average score ${averageForCategory}%` : ''}`}>
                <category.icon 
                  color={selectedCategory === category.id ? '#FFFFFF' : '#007AFF'} 
                  size={20} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}>
                  {category.name}
                </Text>
                {categoryData && category.id !== 'all' && (
                  <Text style={[
                    styles.categoryAverage,
                    selectedCategory === category.id && styles.categoryAverageSelected
                  ]}>
                    {averageForCategory}%
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Exercises List */}
      <View style={styles.exercisesList}>
        <Text style={[styles.listTitle, isRTL && styles.rtlText]}>
          {selectedCategory === 'all' ? 'All Exercises' : categories.find(c => c.id === selectedCategory)?.name} 
          ({filteredExercises.length})
        </Text>
        
        {filteredExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Brain color="#CCCCCC" size={48} />
            <Text style={styles.emptyStateText}>No exercises found in this category</Text>
          </View>
        ) : (
          filteredExercises.map((exercise) => {
            const exerciseProgress = progress.filter(p => p.exercise_id === exercise.id);
            const bestScore = exerciseProgress.length > 0 
              ? Math.max(...exerciseProgress.map(p => p.score))
              : 0;
            const timesCompleted = exerciseProgress.length;

            return (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleExercisePress(exercise)}
                accessibilityRole="button"
                accessibilityLabel={`${exercise.title}, ${exercise.difficulty} difficulty, ${exercise.duration_minutes} minutes${bestScore > 0 ? `, best score ${bestScore}%` : ''}`}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseType}>{exercise.type.replace('_', ' ')}</Text>
                  <View style={styles.exerciseDetails}>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                    </View>
                    <Text style={styles.duration}>{exercise.duration_minutes} min</Text>
                  </View>
                  {bestScore > 0 && (
                    <View style={styles.exerciseStats}>
                      <Text style={styles.bestScore}>Best: {bestScore}%</Text>
                      <Text style={styles.timesCompleted}>Completed: {timesCompleted}x</Text>
                    </View>
                  )}
                </View>
                <ChevronRight color="#666666" size={24} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerRTL: {
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  chart: {
    borderRadius: 16,
  },
  achievementsSection: {
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
  achievementsList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    marginRight: 12,
    alignItems: 'center',
  },
  achievementUnlocked: {
    backgroundColor: '#F0F7FF',
    borderWidth: 2,
    borderColor: '#007AFF20',
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementProgress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 4,
  },
  recommendedSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    gap: 8,
  },
  categorySelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  categoryAverage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  categoryAverageSelected: {
    color: '#FFFFFF80',
  },
  exercisesList: {
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
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
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    textTransform: 'capitalize',
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  bestScore: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#34C759',
  },
  timesCompleted: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});