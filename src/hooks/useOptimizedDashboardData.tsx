import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useOptimizedDashboardData = () => {
  const { session } = useAuth();

  // Optimized single query for stats
  const { data: stats, isLoading: statsLoading } = useOptimizedQuery(
    ['dashboard-stats-optimized', session?.user?.id],
    async () => {
      if (!session) return null;

      // Single optimized query for basic stats
      const [enrollmentCount, progressCount] = await Promise.all([
        supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('status', 'active'),
        
        supabase
          .from('lesson_progress')
          .select('course_id, position_seconds', { count: 'exact' })
          .eq('user_id', session.user.id)
          .eq('completed', true)
      ]);

      const totalCourses = enrollmentCount.count || 0;
      const completedCourses = new Set(progressCount.data?.map(p => p.course_id)).size;
      const totalWatchSeconds = progressCount.data?.reduce((total, p) => total + (p.position_seconds || 0), 0) || 0;
      const hoursWatched = Math.round((totalWatchSeconds / 3600) * 10) / 10;

      return {
        totalCourses,
        completedCourses,
        hoursWatched,
        certificates: completedCourses
      };
    }
  );

  // Optimized query for enrolled courses and applications (limited to 3 for dashboard)
  const { data: enrolledCourses, isLoading: coursesLoading } = useOptimizedQuery(
    ['enrolled-courses-and-applications', session?.user?.id],
    async () => {
      if (!session) return [];

      // Get both approved enrollments and pending applications
      const [enrollmentsRes, applicationsRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            id,
            created_at,
            status,
            courses!inner (
              id,
              title,
              slug,
              poster_url,
              course_type
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('enrollment_submissions')
          .select(`
            id,
            created_at,
            status,
            courses!inner (
              id,
              title,
              slug,
              poster_url,
              course_type
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
      ]);

      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (applicationsRes.error) throw applicationsRes.error;

      // Combine and deduplicate by course_id, prioritizing enrollments over applications
      const enrollments = enrollmentsRes.data || [];
      const applications = applicationsRes.data || [];
      
      const courseMap = new Map();
      
      // Add enrollments first (higher priority)
      enrollments.forEach(enrollment => {
        courseMap.set(enrollment.courses.id, {
          ...enrollment,
          type: 'enrollment',
          applicationStatus: null
        });
      });
      
      // Add applications only if no enrollment exists for that course
      applications.forEach(application => {
        if (!courseMap.has(application.courses.id)) {
          courseMap.set(application.courses.id, {
            ...application,
            type: 'application',
            applicationStatus: application.status
          });
        }
      });

      return Array.from(courseMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
    }
  );

  // Simplified recent activity (last 5 items only)
  const { data: recentActivity, isLoading: activityLoading } = useOptimizedQuery(
    ['recent-activity-simple', session?.user?.id],
    async () => {
      if (!session) return [];

      // Just get enrollments for recent activity to keep it simple
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          created_at,
          courses!inner (title, slug)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

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
