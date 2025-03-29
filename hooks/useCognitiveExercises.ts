import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '@/lib/supabase';

interface CognitiveExercise {
  id: string;
  title: string;
  type: 'memory' | 'attention' | 'problem_solving' | 'language' | 'visual';
  difficulty: 'easy' | 'medium' | 'hard';
  content: any;
  instructions: string;
  duration_minutes: number;
}

interface ExerciseProgress {
  id: string;
  exercise_id: string;
  score: number;
  completion_time: number;
  difficulty: string;
  mistakes: number;
  feedback: any;
  created_at: string;
}

export function useCognitiveExercises(userId: string) {
  const [exercises, setExercises] = useState<CognitiveExercise[]>([]);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [currentExercise, setCurrentExercise] = useState<CognitiveExercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
    loadProgress();

    const subscription = supabase
      .channel('cognitive_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cognitive_progress',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('cognitive_exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading exercises:', error);
      return;
    }

    setExercises(data || []);
    setLoading(false);
  };

  const loadProgress = async () => {
    const { data, error } = await supabase
      .from('cognitive_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    setProgress(data || []);
  };

  const startExercise = async (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setCurrentExercise(exercise);

    if (Platform.OS !== 'web') {
      Speech.speak(exercise.instructions, {
        rate: 0.8,
        pitch: 1.0,
      });
    }
  };

  const completeExercise = async (
    exerciseId: string,
    score: number,
    completionTime: number,
    mistakes: number = 0,
    feedback: any = {}
  ) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const { data, error } = await supabase
      .from('cognitive_progress')
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        score,
        completion_time: completionTime,
        difficulty: exercise.difficulty,
        mistakes,
        feedback
      })
      .select()
      .single();

    if (error) throw error;

    setProgress(current => [data, ...current]);
    setCurrentExercise(null);

    // Provide voice feedback
    if (Platform.OS !== 'web') {
      const feedbackMessage = score >= 80
        ? 'Great job! You did excellent!'
        : score >= 60
        ? 'Good work! Keep practicing to improve.'
        : 'Nice try! Let\'s practice more to get better.';

      Speech.speak(feedbackMessage, {
        rate: 0.8,
        pitch: 1.0,
      });
    }

    return data;
  };

  const getRecommendedExercises = () => {
    if (!exercises.length || !progress.length) return exercises;

    // Calculate average scores per type
    const typeScores = progress.reduce((acc, p) => {
      const exercise = exercises.find(e => e.id === p.exercise_id);
      if (!exercise) return acc;

      if (!acc[exercise.type]) {
        acc[exercise.type] = { total: 0, count: 0 };
      }
      acc[exercise.type].total += p.score;
      acc[exercise.type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Find types that need improvement
    const weakTypes = Object.entries(typeScores)
      .filter(([_, stats]) => (stats.total / stats.count) < 70)
      .map(([type]) => type);

    // Recommend exercises focusing on weak areas
    return exercises
      .filter(e => weakTypes.includes(e.type))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  };

  return {
    exercises,
    progress,
    currentExercise,
    loading,
    startExercise,
    completeExercise,
    getRecommendedExercises,
    recentProgress: progress.slice(0, 5),
    averageScore: progress.length
      ? progress.reduce((sum, p) => sum + p.score, 0) / progress.length
      : 0
  };
}