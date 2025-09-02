import { useState, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/DataTable';
import { FileUpload } from '@/components/FileUpload';
import { StringRepeatableList, RoadmapRepeatableList } from '@/components/RepeatableList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { ResizableRichTextEditor } from '@/components/ResizableRichTextEditor';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Filter, 
  Download, 
  Upload, 
  Archive,
  RefreshCw,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const AdminCoursesIndex = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    return courses.filter(course => {
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      const matchesType = filterType === 'all' || course.course_type === filterType;
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [courses, filterStatus, filterType, searchQuery]);

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (courseIds: string[]) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .in('id', courseIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(`${selectedCourses.length} courses deleted successfully`);
      setBulkDeleteDialogOpen(false);
      setSelectedCourses([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete courses');
    }
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ courseIds, newStatus }: { courseIds: string[]; newStatus: 'draft' | 'published' | 'archived' }) => {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .in('id', courseIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(`Status updated for ${selectedCourses.length} courses`);
      setSelectedCourses([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update course status');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // Get the original course
      const { data: originalCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Create a duplicate with modified title and slug
      const duplicateData = {
        ...originalCourse,
        id: undefined,
        title: `${originalCourse.title} (Copy)`,
        slug: `${originalCourse.slug}-copy-${Date.now()}`,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('courses')
        .insert(duplicateData);
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to duplicate course');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course deleted successfully');
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete course');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ courseId, newStatus }: { courseId: string; newStatus: 'draft' | 'published' | 'archived' }) => {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update course status');
    }
  });

  const columns = [
    {
      key: 'select' as const,
      header: (
        <Checkbox
          checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedCourses(filteredCourses.map(c => c.id));
            } else {
              setSelectedCourses([]);
            }
          }}
        />
      ),
      render: (value: any, course: any) => (
        <Checkbox
          checked={selectedCourses.includes(course.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedCourses(prev => [...prev, course.id]);
            } else {
              setSelectedCourses(prev => prev.filter(id => id !== course.id));
            }
          }}
        />
      )
    },
    {
      key: 'title' as const,
      header: 'Title',
      sortable: true,
      render: (value: string, course: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{course.slug}</p>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {course.course_type || 'Not set'}
            </Badge>
            <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="text-xs">
              {course.status}
            </Badge>
            {course.featured && (
              <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                Featured
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'description' as const,
      header: 'Description',
      render: (value: string) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">
          {value || 'No description'}
        </p>
      )
    },
    {
      key: 'price_regular' as const,
      header: 'Price',
      render: (value: number, course: any) => (
        <div>
          {value ? (
            <div>
              <p className="font-medium">৳{course.price_offer || value}</p>
              {course.price_offer && course.price_offer < value && (
                <p className="text-xs text-muted-foreground line-through">৳{value}</p>
              )}
            </div>
          ) : (
            <span className="text-primary font-medium">Free</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at' as const,
      header: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'updated_at' as const,
      header: 'Updated',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View',
      onClick: (course: any) => navigate(`/courses/${course.slug}`),
      icon: Eye
    },

    {
      label: 'Edit',
      onClick: (course: any) => navigate(`/admin/courses/edit/${course.id}`),
      icon: Edit
    },
    {
      label: 'Duplicate',
      onClick: (course: any) => duplicateMutation.mutate(course.id),
      icon: Copy
    },
    {
      label: 'Toggle Status',
      onClick: (course: any) => {
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        toggleStatusMutation.mutate({ courseId: course.id, newStatus });
      },
      icon: course => course.status === 'published' ? EyeOff : Eye
    },
    {
      label: 'Delete',
      onClick: (course: any) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive' as const,
      icon: Trash2
    }
  ];

  const handleBulkDelete = () => {
    if (selectedCourses.length === 0) {
      toast.error('No courses selected');
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkStatusChange = (newStatus: 'draft' | 'published' | 'archived') => {
    if (selectedCourses.length === 0) {
      toast.error('No courses selected');
      return;
    }
    bulkStatusMutation.mutate({ courseIds: selectedCourses, newStatus });
  };

  const stats = useMemo(() => {
    if (!courses) return { total: 0, published: 0, draft: 0, archived: 0 };
    
    return {
      total: courses.length,
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length,
      archived: courses.filter(c => c.status === 'archived').length
    };
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your course catalog ({stats.total} total courses)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        <Button onClick={() => navigate('/admin/courses/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">{stats.total}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">{stats.published}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm font-bold">{stats.draft}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Archived</p>
              <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">{stats.archived}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by title, description, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="recorded">Recorded</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-800">
              {selectedCourses.length} course(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('published')}
              >
                Publish All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('draft')}
              >
                Draft All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('archived')}
              >
                Archive All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredCourses}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search courses..."
        emptyMessage="No courses found"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />

      {/* Delete Course Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => deleteMutation.mutate(courseToDelete.id)}
        variant="destructive"
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Courses"
        description={`Are you sure you want to delete ${selectedCourses.length} course(s)? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={() => bulkDeleteMutation.mutate(selectedCourses)}
        variant="destructive"
      />
    </div>
  );
};

const AdminCourseForm = ({ courseId }: { courseId?: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!courseId;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    language: 'bn',
    poster_url: '',
    course_type: '' as 'live' | 'recorded' | 'workshop' | '',
    start_date: '',
    time_24h: '',
    duration_text: '',
    seats_text: '',
    price_regular: '',
    price_offer: '',
    whats_included: [] as string[],
    topics: [] as string[],
    roadmap: [] as Array<{ title: string; description?: string }>,
    why_join: [] as string[],
    certificate: false,
    audience: '',
    difficulty: '',
    module_count: '',
    featured: false,

    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  // Load course data for editing
  useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      
      // Populate form with existing data
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        language: data.language || 'bn',
        poster_url: data.poster_url || '',
        course_type: data.course_type || '',
        start_date: data.start_date || '',
        time_24h: data.time_24h || '',
        duration_text: data.duration_text || '',
        seats_text: data.seats_text || '',
        price_regular: data.price_regular?.toString() || '',
        price_offer: data.price_offer?.toString() || '',
        whats_included: Array.isArray(data.whats_included) ? data.whats_included as string[] : [],
        topics: Array.isArray(data.topics) ? data.topics as string[] : [],
        roadmap: Array.isArray(data.roadmap) ? data.roadmap as Array<{ title: string; description?: string }> : [],
        why_join: Array.isArray(data.why_join) ? data.why_join as string[] : [],
        certificate: data.certificate || false,
        audience: data.audience || '',
        difficulty: data.difficulty || '',
        module_count: data.module_count?.toString() || '',
        featured: (data as any).featured || false,

        status: data.status || 'draft'
      });
      
      return data;
    },
    enabled: !!courseId
  });

  const saveMutation = useMutation({
    mutationFn: async (publishAfterSave?: boolean) => {
      const courseData = {
        ...formData,
        price_regular: formData.price_regular ? parseFloat(formData.price_regular) : null,
        price_offer: formData.price_offer ? parseFloat(formData.price_offer) : null,
        module_count: formData.module_count ? parseInt(formData.module_count) : null,
        start_date: formData.start_date || null,
        status: publishAfterSave ? ('published' as const) : formData.status,
        course_type: formData.course_type || null
      };

      if (isEdit) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(isEdit ? 'Course updated' : 'Course created');
      navigate('/admin/courses');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save course');
    }
  });

  // Auto-generate slug from title
  const updateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
    if (!isEdit || !formData.slug) {
      updateSlug(title);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return false;
    }
    if (formData.price_offer && formData.price_regular) {
      if (parseFloat(formData.price_offer) > parseFloat(formData.price_regular)) {
        toast.error('Offer price must be less than regular price');
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    saveMutation.mutate(false);
  };

  const handlePublish = () => {
    if (!validateForm()) return;
    saveMutation.mutate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Course' : 'New Course'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saveMutation.isPending}>
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saveMutation.isPending}>
            {isEdit ? 'Update & Publish' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basics</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Course title"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="course-slug"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Course Description</Label>
                <div className="mt-2">
                  <ResizableRichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Write a compelling course description. Use the toolbar to format text with bold, italic, headings, colors, lists, and more..."
                    minHeight={300}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 <strong>Tip:</strong> Use toolbar buttons like Gmail. Drag corner to resize.
                </p>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Media */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media</h3>
            <div>
              <Label>Course Poster</Label>
              <FileUpload
                bucket="course-posters"
                accept="image/*"
                maxSize={5}
                value={formData.poster_url}
                onUpload={(url) => setFormData(prev => ({ ...prev, poster_url: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, poster_url: '' }))}
              />
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Benefits</h3>
            <div>
              <Label>What's Included</Label>
              <StringRepeatableList
                items={formData.whats_included}
                onItemsChange={(items) => setFormData(prev => ({ ...prev, whats_included: items }))}
                placeholder="What students will get..."
                addButtonText="Add Benefit"
              />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Meta */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Meta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_type">Course Type</Label>
                <Select
                  value={formData.course_type}
                  onValueChange={(value: 'live' | 'recorded' | 'workshop') => setFormData(prev => ({ ...prev, course_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="recorded">Recorded</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="time_24h">Time (24h)</Label>
                <Input
                  id="time_24h"
                  value={formData.time_24h}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_24h: e.target.value }))}
                  placeholder="e.g., 19:00"
                />
                <p className="text-sm text-muted-foreground mt-1">UTC +6 timezone will be displayed to public</p>
              </div>
              
              <div>
                <Label htmlFor="duration_text">Duration</Label>
                <Input
                  id="duration_text"
                  value={formData.duration_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_text: e.target.value }))}
                  placeholder="e.g., 8 weeks"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="seats_text">Seats</Label>
                <Input
                  id="seats_text"
                  value={formData.seats_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats_text: e.target.value }))}
                  placeholder="e.g., Limited to 30 students"
                />
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_regular">Regular Price ($)</Label>
                <Input
                  id="price_regular"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_regular}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_regular: e.target.value }))}
                  placeholder="29.99"
                />
              </div>
              
              <div>
                <Label htmlFor="price_offer">Offer Price ($)</Label>
                <Input
                  id="price_offer"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_offer}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_offer: e.target.value }))}
                  placeholder="19.99"
                />
              </div>
            </div>
          </Card>

          {/* Content Meta */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content</h3>
            <div className="space-y-4">
              <div>
                <Label>Topics</Label>
                <StringRepeatableList
                  items={formData.topics}
                  onItemsChange={(items) => setFormData(prev => ({ ...prev, topics: items }))}
                  placeholder="Course topic..."
                  addButtonText="Add Topic"
                />
              </div>
              
              <div>
                <Label>Learning Roadmap</Label>
                <RoadmapRepeatableList
                  items={formData.roadmap}
                  onItemsChange={(items) => setFormData(prev => ({ ...prev, roadmap: items }))}
                  addButtonText="Add Step"
                />
              </div>
              
              <div>
                <Label>Why Join</Label>
                <StringRepeatableList
                  items={formData.why_join}
                  onItemsChange={(items) => setFormData(prev => ({ ...prev, why_join: items }))}
                  placeholder="Reason to join..."
                  addButtonText="Add Reason"
                />
              </div>
            </div>
          </Card>

          {/* Flags */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Flags</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certificate"
                  checked={formData.certificate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, certificate: Boolean(checked) }))
                  }
                />
                <Label htmlFor="certificate">Certificate Included</Label>
              </div>
              
              <div>
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                  placeholder="e.g., Beginners, Professionals"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="module_count">Module Count</Label>
                <Input
                  id="module_count"
                  type="number"
                  value={formData.module_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, module_count: e.target.value }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                />
                <Label htmlFor="featured">Featured Course</Label>
              </div>
              

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function AdminCourses() {
  return (
    <Routes>
      <Route index element={<AdminCoursesIndex />} />
      <Route path="new" element={<AdminCourseForm />} />
      <Route path="edit/:courseId" element={<AdminCourseFormWrapper />} />
    </Routes>
  );
}

function AdminCourseFormWrapper() {
  const { courseId } = useParams();
  return <AdminCourseForm courseId={courseId} />;
}