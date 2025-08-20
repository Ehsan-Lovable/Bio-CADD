import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDashboardData = () => {
  const { session } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', session?.user?.id],
    queryFn: async () => {
      if (!session) return null;

      // Get enrolled courses count
      const { count: totalCourses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      // Get completed courses count (courses with all lessons completed)
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('course_id, completed')
        .eq('user_id', session.user.id)
        .eq('completed', true);

      // Group by course to count completed courses
      const completedCoursesSet = new Set();
      if (progressData) {
        // For now, assume a course is completed if any lesson is completed
        // In a real app, you'd check if ALL lessons in a course are completed
        progressData.forEach(progress => {
          if (progress.completed) {
            completedCoursesSet.add(progress.course_id);
          }
        });
      }

      // Calculate total watch time (placeholder for now)
      const { data: watchTimeData } = await supabase
        .from('lesson_progress')
        .select('position_seconds')
        .eq('user_id', session.user.id);

      const totalWatchSeconds = watchTimeData?.reduce((total, progress) => 
        total + (progress.position_seconds || 0), 0) || 0;
      const totalWatchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

      return {
        totalCourses: totalCourses || 0,
        completedCourses: completedCoursesSet.size,
        hoursWatched: totalWatchHours,
        certificates: completedCoursesSet.size // For now, certificates = completed courses
      };
    },
    enabled: !!session
  });

  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolled-courses', session?.user?.id],
    queryFn: async () => {
      if (!session) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            slug,
            description,
            poster_url,
            course_type,
            updated_at
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity', session?.user?.id],
    queryFn: async () => {
      if (!session) return [];

      // Get recent enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          created_at,
          courses (title, slug)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent lesson progress
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select(`
          last_watched_at,
          position_seconds,
          completed,
          lessons (title),
          courses (title, slug)
        `)
        .eq('user_id', session.user.id)
        .order('last_watched_at', { ascending: false })
        .limit(5);

      // Combine and sort all activities
      const activities = [
        ...(enrollments?.map(e => ({
          type: 'enrollment' as const,
          timestamp: e.created_at,
          courseTitle: e.courses?.title,
          courseSlug: e.courses?.slug,
          description: `Enrolled in ${e.courses?.title}`
        })) || []),
        ...(progress?.map(p => ({
          type: 'progress' as const,
          timestamp: p.last_watched_at,
          courseTitle: p.courses?.title,
          courseSlug: p.courses?.slug,
          lessonTitle: p.lessons?.title,
          description: p.completed 
            ? `Completed ${p.lessons?.title}` 
            : `Watched ${p.lessons?.title}`
        })) || [])
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    },
    enabled: !!session
  });

  return {
    stats,
    enrolledCourses,
    recentActivity,
    isLoading: statsLoading || coursesLoading || activityLoading
  };
};