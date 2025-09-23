import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/EmptyState';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  BookOpen,
  ChevronRight 
} from 'lucide-react';

interface StudentLessonsListProps {
  courseId: string;
  courseTitle: string;
  showAll?: boolean;
  maxItems?: number;
}

export function StudentLessonsList({ 
  courseId, 
  courseTitle, 
  showAll = false, 
  maxItems = 3 
}: StudentLessonsListProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['student-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('course_id', courseId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="No lessons available"
            description="Lessons will appear here once they're added to the course"
            size="sm"
          />
        </CardContent>
      </Card>
    );
  }

  const displayedLessons = showAll ? lessons : lessons.slice(0, maxItems);
  const completedLessons = progress?.filter(p => p.completed) || [];
  const progressPercentage = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;

  const getLessonProgress = (lessonId: string) => {
    return progress?.find(p => p.lesson_id === lessonId);
  };

  const handleLessonClick = (lessonId: string, videoUrl?: string) => {
    if (videoUrl) {
      setSelectedLesson(lessonId);
      // Open video in a new tab or modal
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Course Lessons {!showAll && `(${courseTitle})`}
          </CardTitle>
          {!showAll && lessons.length > maxItems && (
            <Button variant="ghost" size="sm">
              View All ({lessons.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        {lessons.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{completedLessons.length} of {lessons.length} lessons completed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedLessons.map((lesson, index) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const isCompleted = lessonProgress?.completed || false;
            const hasVideoUrl = !!lesson.video_url;

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  hasVideoUrl 
                    ? 'hover:bg-muted/50 cursor-pointer' 
                    : 'bg-muted/30'
                }`}
                onClick={() => handleLessonClick(lesson.id, lesson.video_url)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{lesson.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    {lesson.duration_minutes && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration_minutes}m</span>
                      </div>
                    )}
                    {lesson.is_preview && (
                      <Badge variant="outline" className="text-xs">
                        Preview
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : hasVideoUrl ? (
                    <Play className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}