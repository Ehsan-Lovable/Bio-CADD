import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedAdminData = () => {
  // Optimized admin dashboard stats
  const { data: stats, isLoading } = useOptimizedQuery(
    ['admin-dashboard-stats-optimized'],
    async () => {
      // Single Promise.all for all count queries
      const [usersRes, coursesRes, submissionsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('dft_submissions').select('*', { count: 'exact', head: true })
      ]);

      // Get recent activity counts in a single batch
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const [recentUsersRes, recentCoursesRes, recentSubmissionsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('dft_submissions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString())
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalSubmissions: submissionsRes.count || 0,
        recentUsers: recentUsersRes.count || 0,
        recentCourses: recentCoursesRes.count || 0,
        recentSubmissions: recentSubmissionsRes.count || 0
      };
    }
  );

  // Simplified recent activity for admin
  const { data: recentActivity } = useOptimizedQuery(
    ['admin-recent-activity-optimized'],
    async () => {
      // Only get the most recent items to avoid complex queries
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentCourses } = await supabase
        .from('courses')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const activities = [];

      if (recentUsers) {
        activities.push(...recentUsers.map(user => ({
          type: 'user_registered',
          title: `${user.full_name || 'New user'} registered`,
          timestamp: user.created_at
        })));
      }

      if (recentCourses) {
        activities.push(...recentCourses.map(course => ({
          type: 'course_created',
          title: `Course "${course.title}" was created`,
          timestamp: course.created_at
        })));
      }

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6); // Limit to 6 items
    }
  );

  return {
    stats,
    recentActivity,
    isLoading
  };
};