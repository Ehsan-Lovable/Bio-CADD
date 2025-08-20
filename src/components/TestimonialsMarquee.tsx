import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Users } from 'lucide-react';

interface TestimonialsMarqueeProps {
  className?: string;
}

export const TestimonialsMarquee = ({ className }: TestimonialsMarqueeProps) => {
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
      <section className={`py-16 bg-cream overflow-hidden ${className || ''}`}>
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
    <section className={`py-16 bg-cream overflow-hidden ${className || ''}`}>
      <div className="mb-8 text-center">
        <h2 className="font-heading font-bold text-3xl mb-2">What Our Students Say</h2>
        <p className="text-muted-foreground">Real feedback from our learning community</p>
      </div>
      
      <div className="relative">
        <div className="flex gap-6 animate-marquee hover:pause">
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