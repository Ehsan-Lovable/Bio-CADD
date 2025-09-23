import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StudentLessonsList } from '@/components/StudentLessonsList';
import { StudentResourcesList } from '@/components/StudentResourcesList';
import { 
  BookOpen, 
  Play, 
  ChevronDown, 
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExpandableCourseCardProps {
  course: {
    id: string;
    type: string;
    applicationStatus?: string;
    courses?: {
      id: string;
      title: string;
      slug: string;
      poster_url?: string;
      course_type?: string;
    };
  };
}

export function ExpandableCourseCard({ course }: ExpandableCourseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isAccessible = course.type === 'enrollment' || course.applicationStatus === 'approved';
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              {course.courses?.poster_url ? (
                <img 
                  src={course.courses.poster_url} 
                  alt={course.courses.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-primary/40" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{course.courses?.title}</h4>
              <p className="text-sm text-muted-foreground">
                {course.courses?.course_type?.charAt(0).toUpperCase() + 
                 course.courses?.course_type?.slice(1) || 'Course'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {course.type === 'enrollment' ? (
                  <Badge variant="default" className="text-xs">
                    Enrolled
                  </Badge>
                ) : (
                  <Badge 
                    variant={
                      course.applicationStatus === 'approved' ? 'default' :
                      course.applicationStatus === 'rejected' ? 'destructive' :
                      'secondary'
                    } 
                    className="text-xs"
                  >
                    {course.applicationStatus === 'approved' ? 'Approved' :
                     course.applicationStatus === 'rejected' ? 'Rejected' :
                     'Under Review'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAccessible ? (
              <Button asChild size="sm" variant="outline">
                <Link to={`/courses/${course.courses?.slug}`}>
                  <Play className="h-4 w-4 mr-2" />
                  View Course
                </Link>
              </Button>
            ) : (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant={isOpen ? "default" : "outline"}>
                    <Play className="h-4 w-4 mr-2" />
                    {isOpen ? 'Collapse' : 'Resume'}
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            )}
          </div>
        </div>
        
        {isAccessible && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StudentLessonsList 
                  courseId={course.courses?.id || ''} 
                  courseTitle={course.courses?.title || 'Course'}
                  showAll={false}
                  maxItems={5}
                />
                <StudentResourcesList 
                  courseId={course.courses?.id || ''} 
                  courseTitle={course.courses?.title || 'Course'}
                  showAll={false}
                  maxItems={5}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}