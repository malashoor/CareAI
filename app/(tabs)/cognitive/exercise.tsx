import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { useCognitiveExercises } from '@/hooks/useCognitiveExercises';

const { width, height } = Dimensions.get('window');

// Memory game component
const MemoryGame = ({ onComplete, difficulty }: { onComplete: (score: number, time: number) => void, difficulty: string }) => {
  const [cards, setCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());

  const gridSize = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const totalPairs = (gridSize * gridSize) / 2;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matchedCards.length === totalPairs * 2) {
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(100 - moves * 2, 10); // Better score for fewer moves
      onComplete(score, completionTime);
    }
  }, [matchedCards]);

  const initializeGame = () => {
    const pairs = Array.from({ length: totalPairs }, (_, i) => i);
    const shuffledCards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardPress = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlippedCards[0]] === cards[newFlippedCards[1]]) {
        // Match found
        setMatchedCards([...matchedCards, ...newFlippedCards]);
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isCardVisible = (index: number) => {
    return flippedCards.includes(index) || matchedCards.includes(index);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameStats}>
        <Text style={styles.statText}>Moves: {moves}</Text>
        <Text style={styles.statText}>Pairs: {matchedCards.length / 2}/{totalPairs}</Text>
      </View>
      
      <View style={[styles.gameGrid, { width: gridSize * 60, height: gridSize * 60 }]}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gameCard}
            onPress={() => handleCardPress(index)}
            disabled={flippedCards.length === 2 && !flippedCards.includes(index)}>
            <View style={[
              styles.cardInner,
              isCardVisible(index) && styles.cardFlipped,
              matchedCards.includes(index) && styles.cardMatched
            ]}>
              <Text style={styles.cardText}>
                {isCardVisible(index) ? card : '?'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function ExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { exercises, startExercise, completeExercise } = useCognitiveExercises(user?.id!);
  
  const [exercise, setExercise] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentExercise = exercises.find(ex => ex.id === id);
    if (currentExercise) {
      setExercise(currentExercise);
      speakInstructions(currentExercise.instructions);
    }

    Animated.fadeIn(fadeAnim).start();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, exercises]);

  useEffect(() => {
    if (isStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isCompleted]);

  const speakInstructions = (text: string) => {
    if (Platform.OS !== 'web') {
      Speech.speak(text, { rate: 0.8, pitch: 1.0 });
    }
  };

  const handleStartExercise = async () => {
    if (exercise) {
      setIsStarted(true);
      await startExercise(exercise.id);
    }
  };

  const handleExerciseComplete = async (score: number, completionTime: number) => {
    if (!exercise) return;

    setIsCompleted(true);
    
    try {
      await completeExercise(exercise.id, score, completionTime);
      
      // Provide feedback
      const feedback = score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practicing!';
      speakInstructions(feedback);
      
      // Navigate to results after delay
      setTimeout(() => {
        router.push({
          pathname: '/cognitive/results',
          params: {
            score,
            completionTime,
            exerciseTitle: exercise.title,
            difficulty: exercise.difficulty
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error completing exercise:', error);
      Alert.alert('Error', 'Failed to save exercise results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#007AFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#007AFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise.title}</Text>
        <TouchableOpacity onPress={() => speakInstructions(exercise.instructions)}>
          <Volume2 color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!isStarted ? (
          <View style={styles.instructionsContainer}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              <Text style={styles.instructionsText}>{exercise.instructions}</Text>
              
              <View style={styles.exerciseInfo}>
                <Text style={styles.infoItem}>Duration: ~{exercise.duration_minutes} min</Text>
                <Text style={styles.infoItem}>Difficulty: {exercise.difficulty}</Text>
                <Text style={styles.infoItem}>Type: {exercise.type}</Text>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={handleStartExercise}>
                <Play color="#FFFFFF" size={24} />
                <Text style={styles.startButtonText}>Start Exercise</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
              <Text style={styles.difficultyBadge}>{exercise.difficulty}</Text>
            </View>

            {exercise.type === 'memory' && (
              <MemoryGame 
                onComplete={handleExerciseComplete}
                difficulty={exercise.difficulty}
              />
            )}

            {exercise.type !== 'memory' && (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  {exercise.type} exercise implementation coming soon!
                </Text>
                <TouchableOpacity 
                  style={styles.simulateButton}
                  onPress={() => handleExerciseComplete(75, timer)}>
                  <Text style={styles.simulateButtonText}>Simulate Completion</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {isCompleted && (
          <View style={styles.completionOverlay}>
            <LinearGradient
              colors={['#34C759', '#32D74B']}
              style={styles.completionCard}>
              <Text style={styles.completionTitle}>Exercise Complete!</Text>
              <Text style={styles.completionText}>Preparing your results...</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </Animated.View>
  );
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
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  instructionsCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exerciseInfo: {
    width: '100%',
    marginBottom: 30,
  },
  infoItem: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  exerciseContainer: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  difficultyBadge: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gameCard: {
    width: 50,
    height: 50,
    margin: 5,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: {
    backgroundColor: '#007AFF',
  },
  cardMatched: {
    backgroundColor: '#34C759',
  },
  cardText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  simulateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  simulateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
}); 