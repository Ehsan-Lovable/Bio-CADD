import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedAdminData = () => {
  // Optimized admin dashboard stats
  const { data: stats, isLoading } = useOptimizedQuery(
    ['admin-dashboard-stats-optimized'],
    async () => {
      try {
        // Single Promise.all for all count queries
        const [usersRes, coursesRes, submissionsRes, lessonsRes, resourcesRes, portfolioRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('dft_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('lessons').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('portfolio_projects').select('*', { count: 'exact', head: true })
        ]);

        // Get recent activity counts in a single batch
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const [recentUsersRes, recentCoursesRes, recentSubmissionsRes, recentLessonsRes, recentResourcesRes] = await Promise.all([
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
            .gte('created_at', sevenDaysAgo.toISOString()),
          supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString()),
          supabase
            .from('resources')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString())
        ]);

        // Get status breakdowns
        const [publishedCourses, draftCourses, activeUsers, pendingSubmissions] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('dft_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        return {
          totalUsers: usersRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalSubmissions: submissionsRes.count || 0,
          totalLessons: lessonsRes.count || 0,
          totalResources: resourcesRes.count || 0,
          totalPortfolio: portfolioRes.count || 0,
          recentUsers: recentUsersRes.count || 0,
          recentCourses: recentCoursesRes.count || 0,
          recentSubmissions: recentSubmissionsRes.count || 0,
          recentLessons: recentLessonsRes.count || 0,
          recentResources: recentResourcesRes.count || 0,
          publishedCourses: publishedCourses.count || 0,
          draftCourses: draftCourses.count || 0,
          activeUsers: activeUsers.count || 0,
          pendingSubmissions: pendingSubmissions.count || 0
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
          totalUsers: 0,
          totalCourses: 0,
          totalSubmissions: 0,
          totalLessons: 0,
          totalResources: 0,
          totalPortfolio: 0,
          recentUsers: 0,
          recentCourses: 0,
          recentSubmissions: 0,
          recentLessons: 0,
          recentResources: 0,
          publishedCourses: 0,
          draftCourses: 0,
          activeUsers: 0,
          pendingSubmissions: 0
        };
      }
    }
  );

  // Enhanced recent activity for admin
  const { data: recentActivity } = useOptimizedQuery(
    ['admin-recent-activity-optimized'],
    async () => {
      try {
        // Get recent items from multiple tables
        const [recentUsers, recentCourses, recentSubmissions, recentLessons, recentPortfolio] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, created_at, role')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('courses')
            .select('title, created_at, status')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('dft_submissions')
            .select('created_at, status')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('lessons')
            .select('title, created_at')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('portfolio_projects')
            .select('title, created_at, status')
            .order('created_at', { ascending: false })
            .limit(2)
        ]);

        const activities = [];

        if (recentUsers?.data) {
          activities.push(...recentUsers.data.map(user => ({
            type: 'user_registered',
            title: `${user.full_name || 'New user'} registered as ${user.role}`,
            timestamp: user.created_at,
            icon: '👤'
          })));
        }

        if (recentCourses?.data) {
          activities.push(...recentCourses.data.map(course => ({
            type: 'course_created',
            title: `Course "${course.title}" was ${course.status}`,
            timestamp: course.created_at,
            icon: '📚'
          })));
        }

        if (recentSubmissions?.data) {
          activities.push(...recentSubmissions.data.map(submission => ({
            type: 'submission_received',
            title: `New DFT submission received (${submission.status})`,
            timestamp: submission.created_at,
            icon: '📝'
          })));
        }

        if (recentLessons?.data) {
          activities.push(...recentLessons.data.map(lesson => ({
            type: 'lesson_created',
            title: `Lesson "${lesson.title}" was created`,
            timestamp: lesson.created_at,
            icon: '🎥'
          })));
        }

        if (recentPortfolio?.data) {
          activities.push(...recentPortfolio.data.map(project => ({
            type: 'portfolio_created',
            title: `Portfolio project "${project.title}" was ${project.status}`,
            timestamp: project.created_at,
            icon: '💼'
          })));
        }

        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8); // Limit to 8 items
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    }
  );

  return {
    stats,
    recentActivity,
    isLoading
  };
};