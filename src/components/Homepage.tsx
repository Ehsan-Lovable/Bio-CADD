import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Play, Users, Award, BookOpen, Clock, Star, Zap, Target, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      return data;
    }
  });

  if (settingsLoading) {
    return (
      <section className="relative bg-true-black text-near-white py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--mustard-500)) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Skeleton className="h-16 w-3/4 mx-auto mb-6 bg-muted/20" />
          <Skeleton className="h-8 w-2/3 mx-auto mb-8 bg-muted/20" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40 bg-muted/20" />
            <Skeleton className="h-12 w-32 bg-muted/20" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-true-black text-near-white py-20 lg:py-32 px-6 overflow-hidden">
      {/* Dotted grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--mustard-500)) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="font-heading font-bold text-5xl lg:text-7xl tracking-tight mb-6 leading-tight">
          {siteSettings?.hero_headline || 'Master New Skills with Expert-Led Courses'}
        </h1>
        <p className="text-xl lg:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {siteSettings?.hero_subtitle || 'Join thousands of learners transforming their careers through high-quality, practical courses designed by industry experts.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/courses">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-mustard group">
              {siteSettings?.hero_cta_label || 'Browse Courses'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="border-near-white/20 text-near-white hover:bg-near-white/10">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeaturedCourses = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .limit(3);
      return data || [];
    }
  });

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
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-mustard transition-all duration-300 overflow-hidden">
              {course.poster_url && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={course.poster_url} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-heading font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.module_count && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.module_count} modules
                      </span>
                    )}
                    {course.duration_text && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration_text}
                      </span>
                    )}
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No courses available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

const TestimonialsMarquee = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('order', { ascending: true });
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-cream overflow-hidden">
        <div className="mb-8 text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="flex gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="min-w-80 p-6">
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-cream overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="font-heading font-bold text-3xl mb-2">What Our Students Say</h2>
        <p className="text-muted-foreground">Real feedback from our learning community</p>
      </div>
      
      <div className="relative">
        <div className="flex gap-6 animate-marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <Card key={`${testimonial.id}-${index}`} className="min-w-80 max-w-80 p-6 flex-shrink-0">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm mb-4 line-clamp-4">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                {testimonial.avatar_url ? (
                  <img 
                    src={testimonial.avatar_url} 
                    alt={testimonial.author_name || 'Student'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{testimonial.author_name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.author_role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('metrics')
        .eq('id', 1)
        .single();
      return data;
    }
  });

  // Static features as fallback
  const staticFeatures = [
    {
      icon: Zap,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience'
    },
    {
      icon: Target,
      title: 'Practical Projects',
      description: 'Build your portfolio with hands-on projects that showcase your skills'
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn verified certificates upon successful course completion'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a vibrant community of learners and get help when you need it'
    },
    {
      icon: BookOpen,
      title: 'Lifetime Access',
      description: 'Access course materials anytime, anywhere, for as long as you need'
    },
    {
      icon: Rocket,
      title: 'Career Growth',
      description: 'Advance your career with skills that are in high demand in the market'
    }
  ];

  const features = Array.isArray(siteSettings?.metrics) ? siteSettings.metrics : staticFeatures;

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-4xl mb-4">Why Choose Our Platform</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in your learning journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.slice(0, 6).map((feature, index) => {
            const IconComponent = staticFeatures[index]?.icon || Zap;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">
                  {feature.title || staticFeatures[index]?.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description || staticFeatures[index]?.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PartnerStrip = () => {
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ['site-settings-partners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('partners')
        .eq('id', 1)
        .single();
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <Skeleton className="h-6 w-48 mx-auto mb-8" />
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const partners = Array.isArray(siteSettings?.partners) ? siteSettings.partners : [];

  if (partners.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wide">
          Trusted by leading companies
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
          {partners.map((partner: any, index: number) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all">
              {partner.logo_url ? (
                <img 
                  src={partner.logo_url} 
                  alt={partner.name || `Partner ${index + 1}`}
                  className="h-12 object-contain"
                />
              ) : (
                <div className="h-12 px-6 bg-muted rounded flex items-center">
                  <span className="font-medium">{partner.name}</span>
                </div>
              )}
            </div>
          ))}
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
      <HeroSection />
      <FeaturedCourses />
      <TestimonialsMarquee />
      <FeatureGrid />
      <PartnerStrip />
      <Newsletter />
    </div>
  );
};

export default Homepage;