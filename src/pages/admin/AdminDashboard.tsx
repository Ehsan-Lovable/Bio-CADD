import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { 
  Users, 
  BookOpen, 
  Upload, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  // Fetch dashboard statistics with optimized queries
  const { data: stats, isLoading } = useOptimizedQuery(
    ['admin-dashboard-stats'],
    async () => {
      // Parallel execution of count queries for better performance
      const [usersRes, coursesRes, submissionsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('dft_submissions').select('id', { count: 'exact', head: true })
      ]);

      // Get recent activity count (last 7 days) - simplified for performance
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const [recentUsersRes, recentCoursesRes, recentSubmissionsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('courses')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('dft_submissions')
          .select('id', { count: 'exact', head: true })
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

  // Fetch recent activity with optimized query
  const { data: recentActivity } = useOptimizedQuery(
    ['admin-recent-activity'],
    async () => {
      // Simplified activity fetch for better performance
      const [recentUsers, recentCourses, recentSubmissions] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('courses')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('dft_submissions')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities = [
        ...(recentUsers.data?.map(user => ({
          type: 'user_registered',
          title: `${user.full_name || 'New user'} registered`,
          timestamp: user.created_at
        })) || []),
        ...(recentCourses.data?.map(course => ({
          type: 'course_created',
          title: `Course "${course.title}" was created`,
          timestamp: course.created_at
        })) || []),
        ...(recentSubmissions.data?.map(submission => ({
          type: 'dft_submission',
          title: `New DFT submission received`,
          timestamp: submission.created_at
        })) || [])
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          value={stats?.totalUsers || 0}
          label="Total Users"
          change={{
            value: stats?.recentUsers || 0,
            period: "last 7 days",
            isPositive: true
          }}
        />
        <StatCard
          icon={BookOpen}
          value={stats?.totalCourses || 0}
          label="Total Courses"
          change={{
            value: stats?.recentCourses || 0,
            period: "last 7 days",
            isPositive: true
          }}
        />
        <StatCard
          icon={Upload}
          value={stats?.totalSubmissions || 0}
          label="DFT Submissions"
          change={{
            value: stats?.recentSubmissions || 0,
            period: "last 7 days",
            isPositive: true
          }}
        />
        <StatCard
          icon={TrendingUp}
          value="98%"
          label="System Health"
          change={{
            value: 2,
            period: "vs last week",
            isPositive: true
          }}
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`
                  w-2 h-2 rounded-full 
                  ${activity.type === 'user_registered' ? 'bg-green-500' : 
                    activity.type === 'course_created' ? 'bg-blue-500' : 'bg-orange-500'}
                `} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </Card>
    </div>
  );
}