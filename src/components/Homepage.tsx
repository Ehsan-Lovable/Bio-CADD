import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { getPublishedCourses } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestimonialsMarquee } from '@/components/TestimonialsMarquee';
import { FeatureGrid } from '@/components/FeatureGrid';
import { PartnerStrip } from '@/components/PartnerStrip';
import { CourseCard } from '@/components/CourseCard';
import HeroBio from '@/components/HeroBio';

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
      <HeroBio />
      <FeaturedCourses />
      <TestimonialsMarquee />
      <FeatureGrid />
      <PartnerStrip />
      <Newsletter />
    </div>
  );
};

export default Homepage;