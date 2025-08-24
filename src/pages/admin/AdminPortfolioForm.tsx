import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingState } from '@/components/LoadingState';
import { FileUpload } from '@/components/FileUpload';
import { RepeatableList } from '@/components/RepeatableList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Trash2, X } from 'lucide-react';

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  summary: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  client_name: z.string().optional(),
  country: z.string().optional(),
  duration_text: z.string().optional(),
  budget_text: z.string().optional(),
  description_md: z.string().optional(),
  hero_image_url: z.string().optional(),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

const SERVICE_OPTIONS = [
  'Genomics (WGS/RNA-seq)',
  'Proteomics (DIA/DDA)',
  'Docking & Virtual Screening',
  'QSAR/ADMET',
  'ML for Omics',
  'Structural Biology',
  'Systems Biology',
  'Metabolomics',
  'Phylogenetics',
  'Biostatistics',
];

const COUNTRY_OPTIONS = [
  'Bangladesh',
  'India',
  'Pakistan',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Netherlands',
  'Sweden',
  'Singapore',
  'Japan',
];

export default function AdminPortfolioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<{ id: string; value: string }[]>([]);
  const [newTech, setNewTech] = useState('');

  const isEdit = !!id;

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      status: 'draft',
      featured: false,
      client_name: '',
      country: '',
      duration_text: '',
      budget_text: '',
      description_md: '',
      hero_image_url: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset(data);
        setServices(data.services || []);
        setTechnologies(
          (data.technologies || []).map((tech, index) => ({
            id: `tech-${index}`,
            value: tech,
          }))
        );
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio project',
        variant: 'destructive',
      });
      navigate('/admin/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    if (!isEdit || !form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const toggleService = (service: string) => {
    setServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const addTechnology = () => {
    if (newTech.trim()) {
      setTechnologies(prev => [
        ...prev,
        { id: `tech-${Date.now()}`, value: newTech.trim() }
      ]);
      setNewTech('');
    }
  };

  const removeTechnology = (id: string) => {
    setTechnologies(prev => prev.filter(tech => tech.id !== id));
  };

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      setSaving(true);

      // Ensure required fields are present
      if (!data.title || !data.slug) {
        throw new Error('Title and slug are required');
      }

      const projectData = {
        title: data.title,
        slug: data.slug,
        summary: data.summary || '',
        status: data.status,
        featured: data.featured,
        client_name: data.client_name || '',
        country: data.country || '',
        duration_text: data.duration_text || '',
        budget_text: data.budget_text || '',
        description_md: data.description_md || '',
        hero_image_url: data.hero_image_url || '',
        services,
        technologies: technologies.map(tech => tech.value),
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update(projectData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Portfolio project updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('portfolio_projects')
          .insert(projectData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Portfolio project created successfully',
        });

        navigate('/admin/portfolio');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save portfolio project',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/portfolio')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update project details' : 'Add a new portfolio project'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basics */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleTitleChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief project description (2-3 lines)"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Featured</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Meta Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 8 weeks" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., $10k-50k" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Services & Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle>Services & Technologies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormLabel>Services</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SERVICE_OPTIONS.map((service) => {
                        const isActive = services.includes(service);
                        return (
                          <Badge
                            key={service}
                            variant={isActive ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-primary/10'
                            }`}
                            onClick={() => toggleService(service)}
                          >
                            {service}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Technologies</FormLabel>
                    <div className="flex gap-2 mt-2 mb-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                      />
                      <Button type="button" onClick={addTechnology}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech) => (
                        <Badge
                          key={tech.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTechnology(tech.id)}
                        >
                          {tech.value}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Study Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description_md"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Markdown)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Write your case study content in Markdown..."
                            rows={12}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Hero Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    bucket="portfolio-images"
                    path={`projects/${form.getValues('slug') || 'temp'}`}
                    accept=".jpg,.jpeg,.png,.webp"
                    maxSize={5 * 1024 * 1024} // 5MB
                    onUpload={(url) => form.setValue('hero_image_url', url)}
                    onRemove={() => form.setValue('hero_image_url', '')}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>

            {isEdit && form.getValues('status') === 'published' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`/portfolio/${form.getValues('slug')}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/portfolio')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}