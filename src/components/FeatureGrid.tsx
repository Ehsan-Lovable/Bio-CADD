import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Target, Award, Users, BookOpen, Rocket } from 'lucide-react';

interface Feature {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features?: Feature[];
  title?: string;
  subtitle?: string;
  className?: string;
  columns?: 2 | 3 | 6;
}

const defaultFeatures: Feature[] = [
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

export const FeatureGrid = ({ 
  features: customFeatures, 
  title = "Why Choose Our Platform",
  subtitle = "Everything you need to succeed in your learning journey",
  className,
  columns = 3
}: FeatureGridProps) => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('metrics')
        .eq('id', 1)
        .single();
      return data;
    },
    enabled: !customFeatures
  });

  const features = customFeatures || 
    (Array.isArray(siteSettings?.metrics) ? siteSettings.metrics : defaultFeatures);

  const gridClass = columns === 2 ? 'md:grid-cols-2' : 
                   columns === 6 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' :
                   'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className={`py-20 px-6 bg-background ${className || ''}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="font-heading font-bold text-4xl mb-4">{title}</h2>}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid ${gridClass} gap-8`}>
          {features.slice(0, columns === 6 ? 6 : features.length).map((feature, index) => {
            const IconComponent = feature.icon || defaultFeatures[index]?.icon || Zap;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">
                  {feature.title || defaultFeatures[index]?.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description || defaultFeatures[index]?.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};