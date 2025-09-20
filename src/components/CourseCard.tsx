import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, Users, Play, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGatedContent } from '@/hooks/useGatedContent';
import { useAuth } from '@/hooks/useAuth';
import { MarkdownViewer } from '@/components/MarkdownViewer';

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
  };
  className?: string;
}

export const CourseCard = ({ course, className }: CourseCardProps) => {
  const { session } = useAuth();
  const { isEnrolled, canViewContent } = useGatedContent(course.id);
  const navigate = useNavigate();

  // Check if course is upcoming (has a start_date in the future)
  const isUpcoming = course.start_date && new Date(course.start_date) > new Date();

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to course detail page for enrollment
    navigate(`/courses/${course.slug}`);
  };

  return (
    <Card className={`group overflow-hidden bg-card border-border/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-xl ${isUpcoming ? 'ring-1 ring-orange-400/30 bg-orange-50/50 dark:bg-orange-950/10' : ''} ${className || ''}`}>
      <Link to={`/courses/${course.slug}`} className="block">
        {/* Compact Image Section */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {course.poster_url ? (
            <img 
              src={course.poster_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          
          {/* Compact Badge Section */}
          <div className="absolute top-3 left-3">
            {isUpcoming && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-2 py-1">
                UPCOMING
              </Badge>
            )}
          </div>
          
          {/* Discount Badge */}
          {course.price_offer && course.price_regular && course.price_offer < course.price_regular && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-1">
                {Math.round(((course.price_regular - course.price_offer) / course.price_regular) * 100)}% OFF
              </Badge>
            </div>
          )}
          
          {/* Course Type Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-background/90 backdrop-blur-sm">
              {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1) || 'Course'}
            </Badge>
          </div>
        </div>
      </Link>
      
      {/* Streamlined Content */}
      <div className="p-4 space-y-3">
        <Link to={`/courses/${course.slug}`}>
          {/* Clean Title */}
          <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          
          {/* Compact Description */}
          {course.description && (
            <div className="text-muted-foreground text-sm line-clamp-1 mb-3">
              <MarkdownViewer 
                content={course.description} 
                className="text-sm [&>p]:mb-0 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm [&>strong]:font-medium [&>*]:line-clamp-1"
              />
            </div>
          )}
          
          {/* Essential Metadata - Only Duration */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {course.duration_text && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration_text}
              </span>
            )}
            {course.module_count && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.module_count} modules
              </span>
            )}
            {course.difficulty && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {course.difficulty}
              </span>
            )}
          </div>
        </Link>
        
        {/* Compact Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {course.price_regular ? (
              <>
                {course.price_offer && course.price_offer < course.price_regular ? (
                  <>
                    <span className="font-bold text-lg text-foreground">${course.price_offer}</span>
                    <span className="text-xs text-muted-foreground line-through">${course.price_regular}</span>
                  </>
                ) : (
                  <span className="font-bold text-lg text-foreground">${course.price_regular}</span>
                )}
              </>
            ) : (
              <span className="font-bold text-lg text-primary">Free</span>
            )}
          </div>
          
          {/* Action Button */}
          {isEnrolled ? (
            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
              Enrolled
            </Badge>
          ) : (
            <Button 
              size="sm" 
              onClick={handleEnrollClick}
              className="text-xs px-3 py-1.5 h-auto"
            >
              Enroll
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};