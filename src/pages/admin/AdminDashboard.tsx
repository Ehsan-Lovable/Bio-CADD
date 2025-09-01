import { useOptimizedAdminData } from '@/hooks/useOptimizedAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Upload, 
  TrendingUp,
  Calendar,
  Clock,
  Video,
  FileText,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';

export default function AdminDashboard() {
  const { stats, recentActivity, isLoading } = useOptimizedAdminData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your bioinformatics platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main KPI Cards */}
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

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLessons || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentLessons || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResources || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentResources || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPortfolio || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Published</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {stats?.publishedCourses || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Draft</span>
              <Badge variant="secondary">
                {stats?.draftCourses || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total</span>
              <Badge variant="outline">
                {stats?.totalCourses || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending</span>
              <Badge variant="destructive">
                {stats?.pendingSubmissions || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total</span>
              <Badge variant="outline">
                {stats?.totalSubmissions || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
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
                <div className="text-lg">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {activity.type.replace('_', ' ')}
                </Badge>
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