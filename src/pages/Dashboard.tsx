import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Trophy, 
  Play, 
  FileText, 
  Users, 
  MessageSquare,
  ChevronRight,
  Calendar,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const { stats, enrolledCourses, recentActivity, isLoading } = useOptimizedDashboardData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {userProfile?.full_name || user?.email?.split('@')[0] || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Continue your learning journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            {userProfile?.role === 'admin' && (
              <Button asChild variant="outline">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            )}
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            value={stats?.totalCourses || 0}
            label="Total Courses"
            borderColor="border-t-primary"
          />
          <StatCard
            icon={Trophy}
            value={stats?.completedCourses || 0}
            label="Completed"
            borderColor="border-t-success"
          />
          <StatCard
            icon={Clock}
            value={`${stats?.hoursWatched || 0}h`}
            label="Hours Watched"
            borderColor="border-t-warning"
          />
          <StatCard
            icon={Award}
            value={stats?.certificates || 0}
            label="Certificates"
            borderColor="border-t-mustard"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-16 flex-col gap-2">
                <Link to="/dashboard">
                  <BookOpen className="h-5 w-5" />
                  My Courses
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-2">
                <Link to="/courses">
                  <Play className="h-5 w-5" />
                  Browse Courses
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-2">
                <Link to="/contact">
                  <MessageSquare className="h-5 w-5" />
                  Support
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-2">
                <Link to="/courses">
                  <FileText className="h-5 w-5" />
                  Resources
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Courses
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/courses" className="flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!enrolledCourses || enrolledCourses.length === 0) ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No courses yet"
                    description="Start your learning journey by enrolling in a course"
                    actionLabel="Browse Courses"
                    actionHref="/courses"
                  />
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                            {enrollment.courses?.poster_url ? (
                              <img 
                                src={enrollment.courses.poster_url} 
                                alt={enrollment.courses.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-primary/40" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{enrollment.courses?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.courses?.course_type?.charAt(0).toUpperCase() + 
                               enrollment.courses?.course_type?.slice(1) || 'Course'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                In Progress
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/courses/${enrollment.courses?.slug}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!recentActivity || recentActivity.length === 0) ? (
                  <EmptyState
                    icon={Calendar}
                    title="No activity yet"
                    description="Start learning to see your progress here"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 6).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                          activity.type === 'enrollment' ? 'bg-primary' : 'bg-success'
                        }`}>
                          {activity.type === 'enrollment' ? (
                            <BookOpen className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}