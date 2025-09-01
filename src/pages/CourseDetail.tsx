import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollment } from '@/hooks/useEnrollment';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/LoadingState';
import { SEOHead } from '@/components/SEOHead';
import { useAnalytics } from '@/lib/analytics';
import { useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  Star,
  CheckCircle,
  Lock,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

const CourseDetailSkeleton = () => (
  <LoadingState type="page" className="max-w-6xl mx-auto" />
);

const CourseDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackCourseView, trackCourseEnrollment } = useAnalytics();
  const { enroll, isEnrolling } = useEnrollment();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course-detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course!.id)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!course?.id
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', course?.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !course?.id) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', course.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!course?.id
  });

  // Track course view
  useEffect(() => {
    if (course) {
      trackCourseView(course.id, course.title);
    }
  }, [course, trackCourseView]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!course) return;

    const success = await enroll(course.id);
    if (success) {
      // Track enrollment
      trackCourseEnrollment(course.id, course.title, finalPrice);
      // Refetch enrollment data
      window.location.reload();
    }
  };

  if (courseLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <CourseDetailSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
            <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
            <Link to="/courses">
              <Button>Browse All Courses</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isEnrolled = !!enrollment;
  const finalPrice = course.price_offer || course.price_regular;

  return (
    <>
      <SEOHead 
        title={course.title}
        description={course.description || `Learn ${course.title} with expert instruction and hands-on projects.`}
        image={course.poster_url}
        type="course"
        course={{
          id: course.id,
          title: course.title,
          description: course.description || undefined,
          duration: course.duration_text || undefined,
          level: course.difficulty || undefined,
          price: finalPrice || undefined,
          currency: 'BDT'
        }}
        tags={Array.isArray(course.topics) ? course.topics : []}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back button */}
          <Link to="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course poster */}
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6 relative">
                {course.poster_url ? (
                  <img 
                    src={course.poster_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant={course.course_type === 'live' ? 'destructive' : 'secondary'} className="text-sm">
                    {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1)}
                  </Badge>
                </div>
                {!isEnrolled && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Course title and description */}
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Meta information */}
              <div className="flex flex-wrap gap-4 mb-8">
                {course.module_count && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.module_count} modules</span>
                  </div>
                )}
                {course.duration_text && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_text}</span>
                  </div>
                )}
                {course.certificate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Certificate included</span>
                  </div>
                )}
                {course.difficulty && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{course.difficulty} level</span>
                  </div>
                )}
                {course.start_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Starts {new Date(course.start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* What you'll get */}
              {Array.isArray(course.whats_included) && course.whats_included.length > 0 && (
                <Card className="p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    What you'll get
                  </h3>
                  <ul className="space-y-3">
                    {course.whats_included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Topics */}
              {Array.isArray(course.topics) && course.topics.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap */}
              {Array.isArray(course.roadmap) && course.roadmap.length > 0 && (
                <Card className="p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Learning Roadmap
                  </h3>
                  <div className="space-y-4">
                    {course.roadmap.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.title || step}</h4>
                          {step.description && (
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Why join */}
              {Array.isArray(course.why_join) && course.why_join.length > 0 && (
                <Card className="p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Why Join This Course
                  </h3>
                  <ul className="space-y-3">
                    {course.why_join.map((reason: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Lessons */}
              {lessons && lessons.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Course Content</h3>
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          {lesson.duration_minutes && (
                            <p className="text-sm text-muted-foreground">
                              {lesson.duration_minutes} minutes
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.is_preview || isEnrolled ? (
                            <div className="flex items-center gap-1 text-primary">
                              <Play className="h-4 w-4" />
                              {lesson.is_preview && !isEnrolled && (
                                <span className="text-xs">Preview</span>
                              )}
                            </div>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                {/* Price */}
                <div className="mb-6">
                  {course.price_regular ? (
                    <div className="flex items-center gap-3 mb-2">
                      {course.price_offer && course.price_offer < course.price_regular ? (
                        <>
                          <span className="text-3xl font-bold text-primary">৳{course.price_offer}</span>
                          <span className="text-lg text-muted-foreground line-through">৳{course.price_regular}</span>
                          <Badge className="bg-danger text-white">
                            {Math.round(((course.price_regular - course.price_offer) / course.price_regular) * 100)}% OFF
                          </Badge>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-primary">৳{course.price_regular}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-primary">Free</span>
                  )}
                </div>

                <Separator className="mb-6" />

                {/* Course info */}
                <div className="space-y-4 mb-6">
                  {course.audience && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{course.audience}</span>
                    </div>
                  )}
                  {course.language && (
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Language: {course.language === 'bn' ? 'Bengali' : course.language}</span>
                    </div>
                  )}
                </div>

                <Separator className="mb-6" />

                {/* CTA */}
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary bg-primary/10 rounded-lg p-3">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You're enrolled!</span>
                    </div>
                    <Button className="w-full" size="lg">
                      Continue Learning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user ? (
                      <Button 
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="w-full" 
                        size="lg"
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="w-full" 
                        size="lg"
                      >
                        Login to Enroll
                      </Button>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;