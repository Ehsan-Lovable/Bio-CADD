import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Video, Radio, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function AdminUpcomingSessions() {
  const queryClient = useQueryClient();
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch upcoming sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-upcoming-sessions', courseTypeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('upcoming_sessions')
        .select(`
          *,
          courses(title, course_type)
        `)
        .order('start_date', { ascending: true });

      if (courseTypeFilter && courseTypeFilter !== 'all') {
        query = query.eq('course_type', courseTypeFilter);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch courses for selection
  const { data: courses } = useQuery({
    queryKey: ['courses-for-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, course_type')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      if (sessionData.id) {
        const { error } = await supabase
          .from('upcoming_sessions')
          .update(sessionData)
          .eq('id', sessionData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('upcoming_sessions')
          .insert(sessionData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-sessions'] });
      toast.success('Session saved successfully');
      setEditingSession(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save session');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('upcoming_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-sessions'] });
      toast.success('Session deleted successfully');
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete session');
    }
  });

  const handleSaveSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sessionData = {
      title: formData.get('title') as string,
      course_id: formData.get('course_id') as string,
      course_type: formData.get('course_type') as 'live' | 'recorded',
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string || null,
      instructor: formData.get('instructor') as string,
      seats: formData.get('seats') ? parseInt(formData.get('seats') as string) : null,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      topics: (formData.get('topics') as string).split(',').map(t => t.trim()),
      level: formData.get('level') as string,
      duration: formData.get('duration') as string,
      sessions_per_week: formData.get('sessions_per_week') ? parseInt(formData.get('sessions_per_week') as string) : null,
      status: 'upcoming'
    };

    if (editingSession?.id) {
      sessionData.id = editingSession.id;
    }

    saveMutation.mutate(sessionData);
  };

  const columns = [
    {
      key: 'title' as const,
      header: 'Session Title',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'course_type' as const,
      header: 'Type',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value === 'live' ? (
            <>
              <Radio className="h-4 w-4 text-violet-600" />
              <Badge variant="default" className="text-xs">Live</Badge>
            </>
          ) : (
            <>
              <Video className="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" className="text-xs">Recorded</Badge>
            </>
          )}
        </div>
      )
    },
    {
      key: 'start_date' as const,
      header: 'Start Date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'instructor' as const,
      header: 'Instructor',
      render: (value: string) => (
        <div className="text-sm text-gray-700">{value}</div>
      )
    },
    {
      key: 'seats' as const,
      header: 'Capacity',
      render: (value: number, row: any) => (
        <div className="text-sm">
          {row.course_type === 'live' ? (
            <span className="text-violet-600">{value} seats</span>
          ) : (
            <span className="text-blue-600">Unlimited</span>
          )}
        </div>
      )
    },
    {
      key: 'price' as const,
      header: 'Price',
      render: (value: number) => (
        <div className="font-medium text-green-600">${value}</div>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'upcoming' ? 'default' : 
          value === 'ongoing' ? 'secondary' : 
          'destructive'
        }>
          {value}
        </Badge>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (session: any) => setEditingSession(session)
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (session: any) => setEditingSession(session)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (session: any) => {
        setSessionToDelete(session);
        setDeleteDialogOpen(true);
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Sessions</h1>
          <p className="text-muted-foreground">Manage live and recorded course sessions</p>
        </div>
        <Button onClick={() => setEditingSession({})}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Type</Label>
              <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="live">Live Sessions</SelectItem>
                  <SelectItem value="recorded">Recorded Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={sessions || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search sessions..."
        emptyMessage="No upcoming sessions found"
      />

      {/* Edit/Create Session Dialog */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveSession} className="p-6 space-y-4">
              <h2 className="text-xl font-bold">
                {editingSession.id ? 'Edit Session' : 'New Session'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    name="title"
                    defaultValue={editingSession.title || ''}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="course_id">Course *</Label>
                  <Select name="course_id" defaultValue={editingSession.course_id || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title} ({course.course_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="course_type">Course Type *</Label>
                  <Select name="course_type" defaultValue={editingSession.course_type || 'live'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live Session</SelectItem>
                      <SelectItem value="recorded">Recorded Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Input
                    name="instructor"
                    defaultValue={editingSession.instructor || ''}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    name="start_date"
                    type="datetime-local"
                    defaultValue={editingSession.start_date ? editingSession.start_date.slice(0, 16) : ''}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    name="end_date"
                    type="datetime-local"
                    defaultValue={editingSession.end_date ? editingSession.end_date.slice(0, 16) : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingSession.price || ''}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select name="level" defaultValue={editingSession.level || 'beginner'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    name="duration"
                    defaultValue={editingSession.duration || ''}
                    placeholder="e.g., 8 weeks"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sessions_per_week">Sessions per Week</Label>
                  <Input
                    name="sessions_per_week"
                    type="number"
                    defaultValue={editingSession.sessions_per_week || ''}
                    placeholder="For live courses"
                  />
                </div>

                <div>
                  <Label htmlFor="seats">Seats Available</Label>
                  <Input
                    name="seats"
                    type="number"
                    defaultValue={editingSession.seats || ''}
                    placeholder="For live courses"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  name="description"
                  defaultValue={editingSession.description || ''}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="topics">Topics (comma-separated) *</Label>
                <Input
                  name="topics"
                  defaultValue={editingSession.topics?.join(', ') || ''}
                  placeholder="e.g., Python, Data Analysis, Visualization"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditingSession(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  Save Session
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Session"
        description={`Are you sure you want to delete "${sessionToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(sessionToDelete.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
