import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLessons() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // Fetch courses for filter
  const { data: courses } = useQuery({
    queryKey: ['courses-for-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch lessons
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['admin-lessons', selectedCourseId],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select(`
          *,
          courses(title)
        `)
        .order('order', { ascending: true });

      if (selectedCourseId) {
        query = query.eq('course_id', selectedCourseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      toast.success('Lesson deleted successfully');
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete lesson');
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (lessonData: any) => {
      if (lessonData.id) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lessonData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      toast.success('Lesson saved successfully');
      setEditingLesson(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save lesson');
    }
  });

  const columns = [
    {
      key: 'title' as const,
      header: 'Title',
      sortable: true
    },
    {
      key: 'courses' as const,
      header: 'Course',
      render: (value: any) => value?.title || 'No course'
    },
    {
      key: 'order' as const,
      header: 'Order',
      sortable: true
    },
    {
      key: 'duration_minutes' as const,
      header: 'Duration',
      render: (value: number) => value ? `${value} min` : '-'
    },
    {
      key: 'is_preview' as const,
      header: 'Preview',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (lesson: any) => setEditingLesson(lesson)
    },
    {
      label: 'Delete',
      onClick: (lesson: any) => {
        setLessonToDelete(lesson);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive' as const
    }
  ];

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const lessonData = {
      ...editingLesson,
      title: formData.get('title') as string,
      course_id: formData.get('course_id') as string,
      video_url: formData.get('video_url') as string,
      order: parseInt(formData.get('order') as string) || 0,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || null,
      is_preview: formData.get('is_preview') === 'true'
    };

    saveMutation.mutate(lessonData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lessons / Recordings</h1>
        <Button onClick={() => setEditingLesson({ course_id: selectedCourseId })}>
          <Plus className="h-4 w-4 mr-2" />
          New Lesson
        </Button>
      </div>

      {/* Course Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="course-filter">Filter by Course:</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <DataTable
        data={lessons || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search lessons..."
        emptyMessage="No lessons found"
      />

      {/* Edit/Create Lesson Dialog */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <h2 className="text-xl font-bold">
                {editingLesson.id ? 'Edit Lesson' : 'New Lesson'}
              </h2>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  name="title"
                  defaultValue={editingLesson.title || ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="course_id">Course *</Label>
                <Select name="course_id" defaultValue={editingLesson.course_id || ''} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  name="video_url"
                  defaultValue={editingLesson.video_url || ''}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    name="order"
                    type="number"
                    defaultValue={editingLesson.order || 0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    name="duration_minutes"
                    type="number"
                    defaultValue={editingLesson.duration_minutes || ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="is_preview">Is Preview</Label>
                <Select name="is_preview" defaultValue={editingLesson.is_preview ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditingLesson(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  Save Lesson
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${lessonToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => deleteMutation.mutate(lessonToDelete.id)}
        variant="destructive"
      />
    </div>
  );
}