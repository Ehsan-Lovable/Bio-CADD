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
  };
  className?: string;
}

export const CourseCard = ({ course, className }: CourseCardProps) => {
  const { session } = useAuth();
  const { isEnrolled, canViewContent } = useGatedContent(course.id);
  const navigate = useNavigate();

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to course detail page for enrollment
    navigate(`/courses/${course.slug}`);
  };

  return (
    <Card className={`group overflow-hidden hover:shadow-mustard transition-all duration-300 ${className || ''}`}>
      <Link to={`/courses/${course.slug}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {course.poster_url ? (
            <img 
              src={course.poster_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge variant={course.course_type === 'live' ? 'destructive' : 'secondary'}>
              {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1) || 'Course'}
            </Badge>
          </div>
          {course.price_offer && course.price_regular && course.price_offer < course.price_regular && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-danger text-white">
                Save {Math.round(((course.price_regular - course.price_offer) / course.price_regular) * 100)}%
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link to={`/courses/${course.slug}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          
          {course.description && (
            <div className="text-muted-foreground text-sm mb-4 line-clamp-2">
              <MarkdownViewer 
                content={course.description} 
                className="text-sm [&>p]:mb-1 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm [&>strong]:font-medium"
              />
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {course.module_count && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.module_count} modules
              </span>
            )}
            {course.duration_text && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration_text}
              </span>
            )}
            {course.certificate && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Certificate
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
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {course.price_regular && (
              <div className="flex items-center gap-2">
                {course.price_offer && course.price_offer < course.price_regular ? (
                  <>
                    <span className="font-bold text-lg text-primary">৳{course.price_offer}</span>
                    <span className="text-sm text-muted-foreground line-through">৳{course.price_regular}</span>
                  </>
                ) : (
                  <span className="font-bold text-lg text-primary">৳{course.price_regular}</span>
                )}
              </div>
            )}
            {!course.price_regular && (
              <span className="font-bold text-lg text-primary">Free</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEnrolled ? (
              <Badge variant="default" className="bg-success text-white">
                Enrolled
              </Badge>
            ) : (
              <Button 
                size="sm" 
                onClick={handleEnrollClick}
                className="ml-2"
              >
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};