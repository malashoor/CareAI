import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  ArrowLeft,
  Clock,
  Home,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  Volume2
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCognitiveExercises } from '../../../hooks/useCognitiveExercises';
import { useAuth } from '../../hooks/useAuth';

export default function ResultsScreen() {
  const router = useRouter();
  const { score, completionTime, exerciseTitle, difficulty } = useLocalSearchParams();
  const { user } = useAuth();
  const { getRecommendedExercises, recentProgress, averageScore } = useCognitiveExercises(user?.id!);
  
  const [showRecommendations, setShowRecommendations] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const scoreValue = Number(score) || 0;
  const timeValue = Number(completionTime) || 0;
  const recommendedExercises = getRecommendedExercises();

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Speak results
    setTimeout(() => {
      speakResults();
    }, 1000);

    // Show recommendations after delay
    setTimeout(() => {
      setShowRecommendations(true);
    }, 2000);
  }, []);

  const speakResults = () => {
    if (Platform.OS !== 'web') {
      const message = `Exercise complete! You scored ${scoreValue} percent in ${formatTime(timeValue)}. ${getScoreMessage()}`;
      Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    if (scoreValue >= 90) return 'Outstanding performance!';
    if (scoreValue >= 80) return 'Excellent work!';
    if (scoreValue >= 70) return 'Good job!';
    if (scoreValue >= 60) return 'Nice effort!';
    return 'Keep practicing to improve!';
  };

  const getScoreColor = () => {
    if (scoreValue >= 80) return '#34C759';
    if (scoreValue >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getPerformanceLevel = () => {
    if (scoreValue >= 90) return 'Outstanding';
    if (scoreValue >= 80) return 'Excellent';
    if (scoreValue >= 70) return 'Good';
    if (scoreValue >= 60) return 'Fair';
    return 'Needs Practice';
  };

  const handleRetry = () => {
    router.back();
  };

  const handleNextExercise = (exerciseId: string) => {
    router.push(`/cognitive/exercise?id=${exerciseId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/cognitive');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToDashboard}>
          <ArrowLeft color="#007AFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Results</Text>
        <TouchableOpacity onPress={speakResults}>
          <Volume2 color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Results Card */}
        <Animated.View 
          style={[
            styles.resultsCard,
            { transform: [{ translateY: slideAnim }] }
          ]}>
          <LinearGradient
            colors={[getScoreColor(), getScoreColor() + '90']}
            style={styles.resultsGradient}>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{scoreValue}%</Text>
              <Text style={styles.performanceLevel}>{getPerformanceLevel()}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock color="#FFFFFF" size={24} />
                <Text style={styles.statValue}>{formatTime(timeValue)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>

              <View style={styles.statItem}>
                <Target color="#FFFFFF" size={24} />
                <Text style={styles.statValue}>{difficulty}</Text>
                <Text style={styles.statLabel}>Difficulty</Text>
              </View>

              <View style={styles.statItem}>
                <Trophy color="#FFFFFF" size={24} />
                <Text style={styles.statValue}>{Math.round(averageScore)}%</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
          <Text style={styles.exerciseMessage}>{getScoreMessage()}</Text>
        </View>

        {/* Progress Comparison */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Recent Average</Text>
              <Text style={styles.progressValue}>{Math.round(averageScore)}%</Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>This Session</Text>
              <Text style={styles.progressValue}>{scoreValue}%</Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Trend</Text>
              <View style={styles.trendContainer}>
                <TrendingUp 
                  color={scoreValue > averageScore ? '#34C759' : '#FF9500'} 
                  size={20} 
                />
                <Text style={[
                  styles.trendText,
                  { color: scoreValue > averageScore ? '#34C759' : '#FF9500' }
                ]}>
                  {scoreValue > averageScore ? '+' : ''}{Math.round(scoreValue - averageScore)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RotateCcw color="#007AFF" size={20} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={handleBackToDashboard}>
            <Home color="#FFFFFF" size={20} />
            <Text style={styles.homeButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        {showRecommendations && (
          <Animated.View 
            style={[
              styles.recommendationsSection,
              { opacity: fadeAnim }
            ]}>
            <Text style={styles.sectionTitle}>Recommended Next</Text>
            
            {recommendedExercises.slice(0, 3).map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.recommendationCard}
                onPress={() => handleNextExercise(exercise.id)}>
                
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{exercise.title}</Text>
                  <Text style={styles.recommendationType}>{exercise.type}</Text>
                  
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationDifficulty}>
                      {exercise.difficulty}
                    </Text>
                    <Text style={styles.recommendationDuration}>
                      ~{exercise.duration_minutes} min
                    </Text>
                  </View>
                </View>

                <View style={styles.recommendationArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for Improvement</Text>
          
          <View style={styles.tipsCard}>
            {getImprovementTips().map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  function getImprovementTips() {
    const tips = [
      'Practice regularly to maintain cognitive sharpness',
      'Try exercises at different difficulty levels',
      'Take breaks between exercises to avoid mental fatigue',
    ];

    if (scoreValue < 70) {
      tips.unshift('Focus on accuracy over speed initially');
    }

    if (timeValue > 300) { // More than 5 minutes
      tips.push('Try to improve your response time with practice');
    }

    return tips;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultsCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultsGradient: {
    padding: 30,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scoreValue: {
    fontSize: 64,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  performanceLevel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  exerciseMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    flex: 0.48,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginLeft: 8,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.48,
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recommendationsSection: {
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 4,
  },
  recommendationType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  recommendationInfo: {
    flexDirection: 'row',
  },
  recommendationDifficulty: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  recommendationDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendationArrow: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#007AFF',
    fontFamily: 'Inter-Bold',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    lineHeight: 20,
    flex: 1,
  },
}); 