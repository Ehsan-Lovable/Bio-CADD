import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGatedContent } from '@/hooks/useGatedContent';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/StarRating';

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    poster_url?: string;
    course_type?: string;
    price_regular?: number;
    price_offer?: number;
    module_count?: number;
    duration_text?: string;
    certificate?: boolean;
    difficulty?: string;
    start_date?: string;
    featured?: boolean;
  };
  className?: string;
}

export const CourseCard = ({ course, className }: CourseCardProps) => {
  const { session } = useAuth();
  const { isEnrolled, canViewContent } = useGatedContent(course.id);

  // Check if course is upcoming (has a start_date in the future)
  const isUpcoming = course.start_date && new Date(course.start_date) > new Date();
  
  // Generate consistent rating based on course ID
  const generateRating = (courseId: string) => {
    let hash = 0;
    for (let i = 0; i < courseId.length; i++) {
      const char = courseId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Generate rating between 4.6 and 5.0
    const rating = 4.6 + (Math.abs(hash) % 5) / 10; // 0-0.4 range + 4.6 base
    return Math.min(5.0, Math.round(rating * 10) / 10); // Round to 1 decimal, max 5.0
  };
  
  const courseRating = generateRating(course.id);

  return (
    <Card className={`group h-full overflow-hidden bg-background border shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-lg ${className || ''}`}>
      {/* Fixed Height Image */}
      <div className="aspect-[16/9] bg-muted relative overflow-hidden">
        <img 
          src={course.poster_url || '/placeholder.svg'} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium">
              FEATURED
            </Badge>
          )}
          {isUpcoming && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">
              UPCOMING
            </Badge>
          )}
        </div>
        
        {/* Course Type Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs font-medium bg-background/90 backdrop-blur-sm uppercase">
            {course.course_type || 'Course'}
          </Badge>
        </div>
      </div>
      
      {/* Card Content */}
      <CardContent className="p-4 flex flex-col justify-between flex-1">
        <div className="space-y-3">
          {/* Course Title */}
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {course.duration_text && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration_text}
              </span>
            )}
            {course.difficulty && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {course.difficulty}
              </span>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          {/* Star Rating */}
          <StarRating rating={courseRating} />
          
          {/* Action Button */}
          {isEnrolled ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
              Enrolled
            </Badge>
          ) : (
            <Button asChild variant="mustard" className="font-medium px-4 py-2">
              <Link to={`/courses/${course.slug}`}>
                Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};