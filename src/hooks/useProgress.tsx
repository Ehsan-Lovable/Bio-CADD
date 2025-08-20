import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useProgress = () => {
  const { session } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProgress = useCallback(async (
    courseId: string,
    lessonId: string,
    positionSeconds: number,
    completed: boolean = false
  ) => {
    if (!session) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: session.user.id,
          course_id: courseId,
          lesson_id: lessonId,
          position_seconds: positionSeconds,
          completed,
          last_watched_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Progress update error:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsUpdating(false);
    }
  }, [session]);

  const getProgress = useCallback(async (courseId: string, lessonId: string) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Progress fetch error:', error);
      return null;
    }
  }, [session]);

  const getCourseProgress = useCallback(async (courseId: string) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons (
            id,
            title,
            duration_minutes
          )
        `)
        .eq('user_id', session.user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Course progress fetch error:', error);
      return null;
    }
  }, [session]);

  return {
    updateProgress,
    getProgress,
    getCourseProgress,
    isUpdating
  };
};