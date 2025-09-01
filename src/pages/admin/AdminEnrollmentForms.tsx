import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/DataTable';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Settings, ArrowUp, ArrowDown } from 'lucide-react';

interface FormField {
  id: string;
  course_id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  field_options: any; // Use any to handle Json type from Supabase
  is_required: boolean;
  field_order: number;
  is_active: boolean;
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'file', label: 'File Upload' }
];

export default function AdminEnrollmentForms() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses } = useQuery({
    queryKey: ['courses-for-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, course_type')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch form fields for selected course
  const { data: formFields, isLoading } = useQuery({
    queryKey: ['enrollment-form-fields', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from('enrollment_form_fields')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('field_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse
  });

  const form = useForm({
    defaultValues: {
      field_name: '',
      field_type: 'text',
      field_label: '',
      field_options: '',
      is_required: false,
      field_order: 1
    }
  });

  // Mutations
  const createFieldMutation = useMutation({
    mutationFn: async (fieldData: any) => {
      const { error } = await supabase
        .from('enrollment_form_fields')
        .insert({
          ...fieldData,
          course_id: selectedCourse,
          field_options: fieldData.field_options ? JSON.stringify(fieldData.field_options.split(',').map((s: string) => s.trim())) : JSON.stringify([])
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-form-fields'] });
      toast.success('Form field created successfully');
      setIsAddFieldOpen(false);
      form.reset();
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('enrollment_form_fields')
        .update({
          ...data,
          field_options: data.field_options ? JSON.stringify(data.field_options.split(',').map((s: string) => s.trim())) : JSON.stringify([])
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-form-fields'] });
      toast.success('Form field updated successfully');
      setEditingField(null);
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enrollment_form_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-form-fields'] });
      toast.success('Form field deleted successfully');
    }
  });

  const updateFieldOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('enrollment_form_fields')
        .update({ field_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-form-fields'] });
    }
  });

  const toggleFieldActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('enrollment_form_fields')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-form-fields'] });
    }
  });

  const onSubmit = (data: any) => {
    if (editingField) {
      updateFieldMutation.mutate({ id: editingField.id, data });
    } else {
      createFieldMutation.mutate(data);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    if (!formFields) return;
    
    const fieldIndex = formFields.findIndex(f => f.id === fieldId);
    const field = formFields[fieldIndex];
    
    if (direction === 'up' && fieldIndex > 0) {
      const prevField = formFields[fieldIndex - 1];
      updateFieldOrderMutation.mutate({ id: field.id, newOrder: prevField.field_order });
      updateFieldOrderMutation.mutate({ id: prevField.id, newOrder: field.field_order });
    } else if (direction === 'down' && fieldIndex < formFields.length - 1) {
      const nextField = formFields[fieldIndex + 1];
      updateFieldOrderMutation.mutate({ id: field.id, newOrder: nextField.field_order });
      updateFieldOrderMutation.mutate({ id: nextField.id, newOrder: field.field_order });
    }
  };

  const openEditDialog = (field: FormField) => {
    setEditingField(field);
    form.reset({
      field_name: field.field_name,
      field_type: field.field_type,
      field_label: field.field_label,
      field_options: Array.isArray(field.field_options) ? field.field_options.join(', ') : 
                     typeof field.field_options === 'string' ? field.field_options : '',
      is_required: field.is_required,
      field_order: field.field_order
    });
  };

  const columns = [
    {
      key: 'field_order' as const,
      header: 'Order',
      render: (value: number, row: FormField) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{value}</span>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(row.id, 'up')}
              disabled={formFields?.[0]?.id === row.id}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(row.id, 'down')}
              disabled={formFields?.[formFields.length - 1]?.id === row.id}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'field_label' as const,
      header: 'Label',
      render: (value: string, row: FormField) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">({row.field_name})</div>
        </div>
      )
    },
    {
      key: 'field_type' as const,
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">
          {fieldTypes.find(t => t.value === value)?.label || value}
        </Badge>
      )
    },
    {
      key: 'is_required' as const,
      header: 'Required',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'is_active' as const,
      header: 'Active',
      render: (value: boolean, row: FormField) => (
        <Switch
          checked={value}
          onCheckedChange={(checked) => 
            toggleFieldActiveMutation.mutate({ id: row.id, isActive: checked })
          }
        />
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: openEditDialog
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: (field: FormField) => {
        if (confirm(`Are you sure you want to delete the field "${field.field_label}"?`)) {
          deleteFieldMutation.mutate(field.id);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enrollment Form Configuration</h1>
          <p className="text-muted-foreground">
            Manage enrollment form fields for courses
          </p>
        </div>
        <Dialog open={isAddFieldOpen || !!editingField} onOpenChange={(open) => {
          if (!open) {
            setIsAddFieldOpen(false);
            setEditingField(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddFieldOpen(true)} disabled={!selectedCourse}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Edit Form Field' : 'Add Form Field'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="field_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name (Internal)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., full_name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="field_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Label (Display)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Full Name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="field_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                {form.watch('field_type') === 'select' && (
                  <FormField
                    control={form.control}
                    name="field_options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Option 1, Option 2, Option 3"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="is_required"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Required Field</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="field_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  {editingField ? 'Update Field' : 'Create Field'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Select Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a course to configure" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title} ({course.course_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={formFields || []}
              columns={columns}
              actions={actions}
              isLoading={isLoading}
              searchPlaceholder="Search form fields..."
              emptyMessage="No form fields configured for this course"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}