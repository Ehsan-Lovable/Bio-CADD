import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  ExternalLink,
  File,
  Video,
  Image,
  ChevronRight 
} from 'lucide-react';

interface StudentResourcesListProps {
  courseId: string;
  courseTitle: string;
  showAll?: boolean;
  maxItems?: number;
}

export function StudentResourcesList({ 
  courseId, 
  courseTitle, 
  showAll = false, 
  maxItems = 3 
}: StudentResourcesListProps) {
  
  const { data: resources, isLoading } = useQuery({
    queryKey: ['student-resources', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
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

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No resources available"
            description="Course resources will appear here when added"
            size="sm"
          />
        </CardContent>
      </Card>
    );
  }

  const displayedResources = showAll ? resources : resources.slice(0, maxItems);

  const getResourceIcon = (resourceType: string | null, url: string) => {
    if (resourceType === 'video' || url.includes('youtube.com') || url.includes('vimeo.com')) {
      return Video;
    }
    if (resourceType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      return Image;
    }
    if (resourceType === 'document' || /\.(pdf|doc|docx)$/i.test(url)) {
      return FileText;
    }
    return File;
  };

  const getResourceTypeLabel = (resourceType: string | null, url: string) => {
    if (resourceType) return resourceType;
    
    if (url.includes('youtube.com') || url.includes('vimeo.com')) return 'video';
    if (/\.(pdf)$/i.test(url)) return 'pdf';
    if (/\.(doc|docx)$/i.test(url)) return 'document';
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';
    
    return 'file';
  };

  const handleResourceClick = async (resource: any) => {
    try {
      // For external URLs, open directly
      if (resource.url.startsWith('http')) {
        window.open(resource.url, '_blank');
        return;
      }

      // For internal files, create signed URL if needed
      const signedUrl = resource.url;
      window.open(signedUrl, '_blank');
      
      toast.success('Resource opened successfully');
    } catch (error) {
      console.error('Error accessing resource:', error);
      toast.error('Failed to access resource');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Course Resources {!showAll && `(${courseTitle})`}
          </CardTitle>
          {!showAll && resources.length > maxItems && (
            <Button variant="ghost" size="sm">
              View All ({resources.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedResources.map((resource) => {
            const ResourceIcon = getResourceIcon(resource.resource_type, resource.url);
            const resourceTypeLabel = getResourceTypeLabel(resource.resource_type, resource.url);
            const isExternal = resource.url.startsWith('http');

            return (
              <div
                key={resource.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <ResourceIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{resource.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {resourceTypeLabel}
                    </Badge>
                    {isExternal && (
                      <Badge variant="outline" className="text-xs">
                        External
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExternal ? (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Download className="h-4 w-4 text-muted-foreground" />
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