import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestimonialsMarquee } from '@/components/TestimonialsMarquee';
import { FeatureGrid } from '@/components/FeatureGrid';
import { PartnerStrip } from '@/components/PartnerStrip';
import { CourseCard } from '@/components/CourseCard';

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
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No courses available yet</p>
          </div>
        )}
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