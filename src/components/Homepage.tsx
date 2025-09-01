import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { getPublishedCourses } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Quote, Star, GraduationCap, Users, Award, Calendar, Clock, Video, Users2, PlayCircle, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestimonialsMarquee } from '@/components/TestimonialsMarquee';
import { FeatureGrid } from '@/components/FeatureGrid';
import { PartnerStrip } from '@/components/PartnerStrip';
import { CourseCard } from '@/components/CourseCard';
import HeroBio from '@/components/HeroBio';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const FeaturedCourses = () => {
  const { data: courses, isLoading } = useOptimizedQuery(
    ['featured-courses'],
    async () => {
      const data = await getPublishedCourses();
      return data.slice(0, 3); // Limit to 3 featured courses
    }
  );

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48 w-full mb-4 rounded-lg" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-4xl mb-4">Featured Courses</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your learning journey with our most popular and highly-rated courses
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(courses || []).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        {(!courses || courses.length === 0) && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No courses available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

const UpcomingSessionsSection = () => {
  // Mock upcoming sessions data - in a real app, this would come from your database
  const upcomingSessions = [
    {
      id: 1,
      title: "Advanced Bioinformatics Analysis",
      courseType: "live",
      startDate: "2024-02-15T10:00:00Z",
      endDate: "2024-02-15T12:00:00Z",
      instructor: "Dr. Sarah Chen",
      seats: 25,
      enrolled: 18,
      price: 299,
      description: "Master advanced genomic data analysis techniques with hands-on projects.",
      topics: ["Genomic Analysis", "Statistical Methods", "Data Visualization"],
      level: "Advanced",
      duration: "8 weeks",
      sessionsPerWeek: 2
    },
    {
      id: 2,
      title: "Machine Learning in Life Sciences",
      courseType: "live",
      startDate: "2024-02-20T14:00:00Z",
      endDate: "2024-02-20T16:00:00Z",
      instructor: "Dr. Michael Rodriguez",
      seats: 20,
      enrolled: 15,
      price: 399,
      description: "Learn to apply ML algorithms to biological datasets and research problems.",
      topics: ["Python", "Scikit-learn", "Biological Data"],
      level: "Intermediate",
      duration: "10 weeks",
      sessionsPerWeek: 2
    },
    {
      id: 3,
      title: "Python for Bioinformatics",
      courseType: "recorded",
      startDate: "2024-02-25T00:00:00Z",
      endDate: null,
      instructor: "Dr. Alex Thompson",
      seats: null,
      enrolled: 45,
      price: 199,
      description: "Complete Python programming course designed specifically for biologists.",
      topics: ["Python Basics", "BioPython", "Data Processing"],
      level: "Beginner",
      duration: "6 weeks",
      sessionsPerWeek: null
    },
    {
      id: 4,
      title: "Next-Generation Sequencing Analysis",
      courseType: "live",
      startDate: "2024-03-01T09:00:00Z",
      endDate: "2024-03-01T11:00:00Z",
      instructor: "Dr. James Wilson",
      seats: 15,
      enrolled: 12,
      price: 499,
      description: "Comprehensive NGS data analysis from raw reads to biological insights.",
      topics: ["NGS Pipeline", "Quality Control", "Variant Calling"],
      level: "Advanced",
      duration: "12 weeks",
      sessionsPerWeek: 2
    },
    {
      id: 5,
      title: "Statistical Analysis in Genomics",
      courseType: "recorded",
      startDate: "2024-03-05T00:00:00Z",
      endDate: null,
      instructor: "Dr. Priya Patel",
      seats: null,
      enrolled: 38,
      price: 249,
      description: "Statistical methods and R programming for genomic data analysis.",
      topics: ["R Programming", "Statistical Tests", "Genomic Statistics"],
      level: "Intermediate",
      duration: "8 weeks",
      sessionsPerWeek: null
    },
    {
      id: 6,
      title: "Genomic Data Visualization",
      courseType: "recorded",
      startDate: "2024-03-10T00:00:00Z",
      endDate: null,
      instructor: "Dr. Emily Watson",
      seats: null,
      enrolled: 52,
      price: 179,
      description: "Create compelling visualizations for genomic research and presentations.",
      topics: ["Plotly", "ggplot2", "Interactive Charts"],
      level: "Beginner",
      duration: "4 weeks",
      sessionsPerWeek: null
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Started';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getSeatsStatus = (enrolled: number, seats: number | null) => {
    if (!seats) return null;
    const remaining = seats - enrolled;
    if (remaining <= 0) return 'Full';
    if (remaining <= 3) return 'Almost Full';
    return `${remaining} seats left`;
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-white via-violet-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calendar className="h-4 w-4" />
            Upcoming Sessions
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6 text-gray-900">
            Join Our Next Learning Sessions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our upcoming <span className="font-semibold text-violet-600">live interactive sessions</span> or 
            <span className="font-semibold text-blue-600"> self-paced recorded courses</span>. 
            Secure your spot before sessions fill up!
          </p>
        </div>

        {/* Course Type Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Live Sessions</span>
            <Radio className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Recorded Courses</span>
            <Video className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Upcoming Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="group hover:shadow-lg transition-all duration-300 border-violet-100 hover:border-violet-200 bg-white overflow-hidden">
              {/* Course Type Indicator */}
              <div className={`px-4 py-2 text-white text-sm font-medium flex items-center justify-between ${
                session.courseType === 'live' ? 'bg-violet-600' : 'bg-blue-600'
              }`}>
                <div className="flex items-center gap-2">
                  {session.courseType === 'live' ? (
                    <>
                      <Radio className="h-4 w-4" />
                      Live Session
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Recorded Course
                    </>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {session.level}
                </Badge>
              </div>

              <CardContent className="p-6">
                {/* Title and Description */}
                <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                  {session.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {session.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-4">
                  <Users2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Instructor:</span> {session.instructor}
                  </span>
                </div>

                {/* Session Details */}
                <div className="space-y-3 mb-6">
                  {session.courseType === 'live' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-600" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Starts:</span> {formatDate(session.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-violet-600" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Time:</span> {formatTime(session.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-violet-600" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Duration:</span> {session.duration} ({session.sessionsPerWeek} sessions/week)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Available from:</span> {formatDate(session.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">Duration:</span> {session.duration}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Topics */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Live Session Specific Info */}
                {session.courseType === 'live' && (
                  <div className="mb-6 p-3 bg-violet-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-violet-800">Seats Available</span>
                      <span className="text-sm text-violet-600">{session.enrolled}/{session.seats}</span>
                    </div>
                    <div className="w-full bg-violet-200 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(session.enrolled / session.seats) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-violet-600">
                        {getSeatsStatus(session.enrolled, session.seats)}
                      </span>
                      <span className="text-xs text-violet-600">
                        {getDaysUntil(session.startDate)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    ${session.price}
                  </div>
                  <Button 
                    className={`${
                      session.courseType === 'live' 
                        ? 'bg-violet-600 hover:bg-violet-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {session.courseType === 'live' ? 'Enroll Now' : 'Start Learning'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-violet-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-600 mb-6">
              Browse our complete course catalog or contact us to discuss custom training programs for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3">
                View All Courses
              </Button>
              <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50 px-8 py-3">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  // Mock testimonials data - in a real app, this would come from your database
  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "Research Scientist",
      company: "Genomics Institute",
      avatar: "SC",
      course: "Advanced Bioinformatics Analysis",
      batch: "Batch 3",
      rating: 5,
      testimonial: "The bioinformatics course transformed my research capabilities. I can now analyze genomic data with confidence and have published two papers using the techniques I learned.",
      courseType: "live"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Data Analyst",
      company: "Biotech Solutions",
      avatar: "MR",
      course: "Machine Learning in Life Sciences",
      batch: "Batch 7",
      rating: 5,
      testimonial: "Outstanding course! The instructors made complex ML concepts accessible for biologists. I've implemented several algorithms in my daily work.",
      courseType: "live"
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      role: "Postdoctoral Fellow",
      company: "University Research Lab",
      avatar: "EW",
      course: "Genomic Data Visualization",
      batch: "Batch 5",
      rating: 5,
      testimonial: "This course filled a crucial gap in my skill set. The visualization techniques I learned have made my presentations much more impactful.",
      courseType: "recorded"
    },
    {
      id: 4,
      name: "Alex Thompson",
      role: "Graduate Student",
      company: "Molecular Biology Dept",
      avatar: "AT",
      course: "Python for Bioinformatics",
      batch: "Batch 2",
      rating: 5,
      testimonial: "As someone with no programming background, this course was perfect. The step-by-step approach and real-world examples made everything click.",
      courseType: "live"
    },
    {
      id: 5,
      name: "Dr. Priya Patel",
      role: "Clinical Researcher",
      company: "Medical Center",
      avatar: "PP",
      course: "Statistical Analysis in Genomics",
      batch: "Batch 4",
      rating: 5,
      testimonial: "The statistical foundation I gained here has been invaluable for my clinical research. Highly recommend for anyone in medical genomics.",
      courseType: "recorded"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Bioinformatics Specialist",
      company: "Pharmaceutical Company",
      avatar: "JW",
      course: "Next-Generation Sequencing Analysis",
      batch: "Batch 6",
      rating: 5,
      testimonial: "Comprehensive coverage of NGS analysis. The hands-on projects gave me practical experience that directly applies to my work.",
      courseType: "live"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-violet-50 via-white to-violet-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            Success Stories
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6 text-gray-900">
            See What Our Graduates Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join over <span className="font-semibold text-violet-600">500+ professionals</span> who have transformed their careers with our bioinformatics courses. 
            From research scientists to data analysts, discover how our programs have accelerated their success.
          </p>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">500+</div>
            <div className="text-sm text-gray-600">Graduates</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">4.9/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">25+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-lg transition-all duration-300 border-violet-100 hover:border-violet-200 bg-white">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-end mb-4">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Quote className="h-4 w-4 text-violet-600" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  "{testimonial.testimonial}"
                </p>

                {/* Course Info */}
                <div className="mb-4 p-3 bg-violet-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-violet-800">
                      {testimonial.course}
                    </span>
                    <Badge variant={testimonial.courseType === 'live' ? 'default' : 'secondary'} className="text-xs">
                      {testimonial.courseType === 'live' ? 'Live Course' : 'Recorded'}
                    </Badge>
                  </div>
                  {testimonial.courseType === 'live' && (
                    <p className="text-xs text-violet-600 mt-1">{testimonial.batch}</p>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-violet-100">
                    <AvatarFallback className="bg-violet-600 text-white font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-violet-600">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-violet-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Career?
            </h3>
            <p className="text-gray-600 mb-6">
              Join our community of successful professionals and take the next step in your bioinformatics journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3">
                Explore Courses
              </Button>
              <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50 px-8 py-3">
                View All Testimonials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="py-16 px-6 bg-true-black text-near-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-heading font-bold text-3xl mb-4">Stay Updated</h2>
        <p className="text-zinc-300 mb-6">
          Get the latest course updates and learning tips delivered to your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-3 rounded-lg bg-near-white/10 border border-near-white/20 text-near-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  );
};

const Homepage = () => {
  return (
    <div>
      <HeroBio />
      <FeaturedCourses />
      <UpcomingSessionsSection />
      <TestimonialsSection />
      <TestimonialsMarquee />
      <FeatureGrid />
      <PartnerStrip />
      <Newsletter />
    </div>
  );
};

export default Homepage;