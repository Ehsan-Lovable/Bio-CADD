import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminResources() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Fetch courses for linking
  const { data: courses } = useQuery({
    queryKey: ['courses-for-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          courses(title)
        `)
        .order('order', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      toast.success('Resource deleted successfully');
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete resource');
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      if (resourceData.id) {
        const { error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resourceData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resources')
          .insert(resourceData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      toast.success('Resource saved successfully');
      setEditingResource(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save resource');
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
      render: (value: any) => value?.title || 'Global'
    },
    {
      key: 'resource_type' as const,
      header: 'Type',
      render: (value: string) => (
        <span className="capitalize px-2 py-1 rounded text-xs bg-muted">
          {value || 'Document'}
        </span>
      )
    },
    {
      key: 'order' as const,
      header: 'Order',
      sortable: true
    },
    {
      key: 'url' as const,
      header: 'URL/File',
      render: (value: string) => (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          View
        </a>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (resource: any) => setEditingResource(resource)
    },
    {
      label: 'Delete',
      onClick: (resource: any) => {
        setResourceToDelete(resource);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive' as const
    }
  ];

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const resourceData = {
      ...editingResource,
      title: formData.get('title') as string,
      course_id: formData.get('course_id') as string || null,
      resource_type: formData.get('resource_type') as string,
      order: parseInt(formData.get('order') as string) || 0,
      url: editingResource.url || ''
    };

    saveMutation.mutate(resourceData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resources</h1>
        <Button onClick={() => setEditingResource({})}>
          <Plus className="h-4 w-4 mr-2" />
          New Resource
        </Button>
      </div>

      <DataTable
        data={resources || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search resources..."
        emptyMessage="No resources found"
      />

      {/* Edit/Create Resource Dialog */}
      {editingResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveResource} className="p-6 space-y-4">
              <h2 className="text-xl font-bold">
                {editingResource.id ? 'Edit Resource' : 'New Resource'}
              </h2>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  name="title"
                  defaultValue={editingResource.title || ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="course_id">Course (optional)</Label>
                <Select name="course_id" defaultValue={editingResource.course_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Global resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Global (not linked to course)</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resource_type">Resource Type</Label>
                <Select name="resource_type" defaultValue={editingResource.resource_type || 'document'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={editingResource.order || 0}
                />
              </div>

              <div>
                <Label>File Upload or External URL</Label>
                <div className="space-y-3">
                  <FileUpload
                    bucket="documents"
                    accept="*/*"
                    maxSize={50}
                    value={editingResource.url}
                    onUpload={(url) => setEditingResource(prev => ({ ...prev, url }))}
                    onRemove={() => setEditingResource(prev => ({ ...prev, url: '' }))}
                  />
                  <div className="text-center text-sm text-muted-foreground">OR</div>
                  <div>
                    <Label htmlFor="external_url">External URL</Label>
                    <Input
                      value={editingResource.url || ''}
                      onChange={(e) => setEditingResource(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditingResource(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  Save Resource
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resourceToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => deleteMutation.mutate(resourceToDelete.id)}
        variant="destructive"
      />
    </div>
  );
}