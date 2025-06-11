import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface CognitiveExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  duration: number; // in minutes
  completed: boolean;
  lastCompleted?: string;
}

export function useCognitiveExercises() {
  const [exercises, setExercises] = useState<CognitiveExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cognitive_exercises')
        .select('*')
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function markExerciseCompleted(id: string) {
    try {
      const { data, error } = await supabase
        .from('cognitive_exercises')
        .update({ 
          completed: true,
          lastCompleted: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setExercises(prev => 
        prev.map(ex => ex.id === id ? data : ex)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }

  return {
    exercises,
    loading,
    error,
    markExerciseCompleted,
    refreshExercises: fetchExercises
  };
} 