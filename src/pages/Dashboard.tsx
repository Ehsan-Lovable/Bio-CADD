import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateCard } from '@/components/CertificateCard';
import { StudentLessonsList } from '@/components/StudentLessonsList';
import { StudentResourcesList } from '@/components/StudentResourcesList';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Trophy,
  Download,
  Play, 
  FileText, 
  Users, 
  MessageSquare,
  ChevronRight,
  Calendar,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const { stats, enrolledCourses, recentActivity, isLoading } = useOptimizedDashboardData();
  const { getUserCertificates, downloadCertificate } = useCertificates();
  const navigate = useNavigate();
  
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (user) {
        setCertificatesLoading(true);
        const userCertificates = await getUserCertificates();
        setCertificates(userCertificates);
        setCertificatesLoading(false);
      }
    };
    
    fetchCertificates();
  }, [user]);

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
                    {enrolledCourses.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                            {item.courses?.poster_url ? (
                              <img 
                                src={item.courses.poster_url} 
                                alt={item.courses.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-primary/40" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.courses?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.courses?.course_type?.charAt(0).toUpperCase() + 
                               item.courses?.course_type?.slice(1) || 'Course'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.type === 'enrollment' ? (
                                <Badge variant="default" className="text-xs">
                                  Enrolled
                                </Badge>
                              ) : (
                                <Badge 
                                  variant={
                                    item.applicationStatus === 'approved' ? 'default' :
                                    item.applicationStatus === 'rejected' ? 'destructive' :
                                    'secondary'
                                  } 
                                  className="text-xs"
                                >
                                  {item.applicationStatus === 'approved' ? 'Approved' :
                                   item.applicationStatus === 'rejected' ? 'Rejected' :
                                   'Under Review'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button asChild size="sm" disabled={item.type === 'application' && item.applicationStatus !== 'approved'}>
                          <Link to={`/courses/${item.courses?.slug}`}>
                            <Play className="h-4 w-4 mr-2" />
                            {item.type === 'enrollment' ? 'Resume' : 'View Course'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Content - Show lessons and resources for enrolled courses */}
            {enrolledCourses && enrolledCourses.length > 0 && (
              <div className="mt-8 space-y-6">
                {enrolledCourses
                  .filter(item => item.type === 'enrollment' || item.applicationStatus === 'approved')
                  .slice(0, 2)
                  .map((item) => (
                    <div key={`content-${item.id}`} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StudentLessonsList 
                          courseId={item.courses?.id || ''} 
                          courseTitle={item.courses?.title || 'Course'}
                          maxItems={3}
                        />
                        <StudentResourcesList 
                          courseId={item.courses?.id || ''} 
                          courseTitle={item.courses?.title || 'Course'}
                          maxItems={3}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  My Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificatesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (!certificates || certificates.length === 0) ? (
                  <EmptyState
                    icon={Award}
                    title="No certificates yet"
                    description="Complete courses to earn certificates"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-4">
                    {certificates.slice(0, 3).map((certificate) => (
                      <CertificateCard
                        key={certificate.id}
                        certificate={certificate}
                        onDownload={downloadCertificate}
                        showActions={true}
                      />
                    ))}
                    {certificates.length > 3 && (
                      <div className="text-center pt-4">
                        <Link to="/dashboard/certificates">
                          <Button variant="outline" size="sm">
                            View All Certificates ({certificates.length})
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
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