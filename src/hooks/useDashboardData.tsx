import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDashboardData = () => {
  const { session } = useAuth();

  const { data: stats, isLoading: statsLoading } = useOptimizedQuery(
    ['dashboard-stats', session?.user?.id],
    async () => {
      if (!session) return null;

      // Single optimized query to get all stats at once
      const [enrollmentsRes, progressRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('status', 'active'),
        supabase
          .from('lesson_progress')
          .select('course_id, completed, position_seconds')
          .eq('user_id', session.user.id)
      ]);

      const totalCourses = enrollmentsRes.count || 0;
      const progressData = progressRes.data || [];
      
      // Count completed courses (assume completed if any lesson is completed)
      const completedCoursesSet = new Set();
      let totalWatchSeconds = 0;
      
      progressData.forEach(progress => {
        if (progress.completed) {
          completedCoursesSet.add(progress.course_id);
        }
        totalWatchSeconds += progress.position_seconds || 0;
      });

      const totalWatchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

      return {
        totalCourses,
        completedCourses: completedCoursesSet.size,
        hoursWatched: totalWatchHours,
        certificates: completedCoursesSet.size
      };
    }
  );

  const { data: enrolledCourses, isLoading: coursesLoading } = useOptimizedQuery(
    ['enrolled-courses', session?.user?.id],
    async () => {
      if (!session) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          created_at,
          courses (
            id,
            title,
            slug,
            poster_url,
            course_type
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10); // Limit to reduce data transfer

      if (error) throw error;
      return data || [];
    }
  );

  const { data: recentActivity, isLoading: activityLoading } = useOptimizedQuery(
    ['recent-activity', session?.user?.id],
    async () => {
      if (!session) return [];

      // Simplified recent activity - just get enrollments for better performance
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('created_at, courses!inner(title)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      return enrollments?.map(e => ({
        type: 'enrollment' as const,
        timestamp: e.created_at,
        description: `Enrolled in ${e.courses?.title}`
      })) || [];
    }
  );

  return {
    stats,
    enrolledCourses,
    recentActivity,
    isLoading: statsLoading || coursesLoading || activityLoading
  };
};