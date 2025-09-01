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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

export default function AdminBlog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<BlogPostInsert | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [localeFilter, setLocaleFilter] = useState('all');

  // Fetch blog posts
  const { data: posts, isLoading, error: postsError } = useQuery({
    queryKey: ['admin-blog-posts', statusFilter, categoryFilter, localeFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter as BlogPost['status']);
        }

        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        if (localeFilter && localeFilter !== 'all') {
          query = query.eq('locale', localeFilter as BlogPost['locale']);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') { // Table doesn't exist
          return [];
        }
        throw error;
      }
    },
    retry: false
  });

  // Fetch categories
  const { data: categories, error: categoriesError } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('name, slug')
          .order('name');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') { // Table doesn't exist
          return [];
        }
        throw error;
      }
    },
    retry: false
  });

  // Fetch series
  const { data: series, error: seriesError } = useQuery({
    queryKey: ['blog-series'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_series')
          .select('key, title')
          .order('title');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching series:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') { // Table doesn't exist
          return [];
        }
        throw error;
      }
    },
    retry: false
  });

  const saveMutation = useMutation({
    mutationFn: async (postData: BlogPostInsert) => {
      if (postData.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...postData,
            updated_by: user?.id || ''
          })
          .eq('id', postData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_by: user?.id || '',
            updated_by: user?.id || ''
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post saved successfully');
      setEditingPost(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save blog post');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post deleted successfully');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete blog post');
    }
  });

  const handleSavePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validate required fields
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const cover_alt = formData.get('cover_alt') as string;
    const body_md = formData.get('body_md') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const authors = formData.get('authors') as string;
    const status = formData.get('status') as string;
    const visibility = formData.get('visibility') as string;
    const locale = formData.get('locale') as string;

    // Check if required fields are empty
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !cover_alt.trim() || !body_md.trim() || !category.trim() || !tags.trim() || !authors.trim() || !status.trim() || !visibility.trim() || !locale.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const postData: BlogPostInsert = {
      title: title.trim(),
      subtitle: (formData.get('subtitle') as string)?.trim() || null,
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      cover_image_url: (formData.get('cover_image_url') as string)?.trim() || null,
      cover_alt: cover_alt.trim(),
      cover_caption: (formData.get('cover_caption') as string)?.trim() || null,
      body_md: body_md.trim(),
      category: category.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      authors: authors.split(',').map(t => t.trim()).filter(Boolean),
      series_key: formData.get('series_key') as string === 'none' ? null : (formData.get('series_key') as string || null),
      series_order: formData.get('series_order') ? parseInt(formData.get('series_order') as string) : null,
      locale: locale as BlogPost['locale'],
      featured: formData.get('featured') === 'on',
      pinned: formData.get('pinned') === 'on',
      comments_enabled: formData.get('comments_enabled') === 'on',
      status: status as BlogPost['status'],
      visibility: visibility as BlogPost['visibility'],
      publish_at_utc: formData.get('publish_at_utc') as string || null,
      seo_title: (formData.get('seo_title') as string)?.trim() || null,
      seo_description: (formData.get('seo_description') as string)?.trim() || null,
      canonical_url: (formData.get('canonical_url') as string)?.trim() || null,
      og_image_url: (formData.get('og_image_url') as string)?.trim() || null,
      created_by: user?.id || '',
      updated_by: user?.id || ''
    };

    if (editingPost?.id) {
      postData.id = editingPost.id;
    }

    saveMutation.mutate(postData);
  };

  const handleEditPost = (post: BlogPost) => {
    // Ensure all required fields have proper values
    const safePost: BlogPostInsert = {
      ...post,
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      cover_alt: post.cover_alt || '',
      body_md: post.body_md || '',
      category: post.category || 'general',
      tags: post.tags || [],
      authors: post.authors || [],
      locale: post.locale || 'en',
      status: post.status || 'draft',
      visibility: post.visibility || 'public',
      featured: post.featured || false,
      pinned: post.pinned || false,
      comments_enabled: post.comments_enabled !== false,
      created_by: user?.id || '',
      updated_by: user?.id || ''
    };
    setEditingPost(safePost);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4 text-gray-500" />;
      case 'in_review': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-400" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'unlisted': return <EyeOff className="h-4 w-4 text-yellow-500" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'title' as const,
      header: 'Title',
      render: (value: string, row: BlogPost) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{value}</div>
          {row.subtitle && (
            <div className="text-sm text-gray-500 truncate">{row.subtitle}</div>
          )}
        </div>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge variant={
            value === 'published' ? 'default' : 
            value === 'scheduled' ? 'secondary' : 
            value === 'in_review' ? 'outline' : 
            'secondary'
          }>
            {value.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    {
      key: 'visibility' as const,
      header: 'Visibility',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getVisibilityIcon(value)}
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        </div>
      )
    },
    {
      key: 'category' as const,
      header: 'Category',
      render: (value: string) => (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'authors' as const,
      header: 'Authors',
      render: (value: string[]) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">
            {value.slice(0, 2).join(', ')}
            {value.length > 2 && ` +${value.length - 2}`}
          </span>
        </div>
      )
    },
    {
      key: 'created_at' as const,
      header: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'View',
      onClick: (post: BlogPost) => window.open(`/blog/${post.slug}`, '_blank')
    },
    {
      label: 'Edit',
      onClick: (post: BlogPost) => handleEditPost(post)
    },
    {
      label: 'Delete',
      onClick: (post: BlogPost) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive' as const
    }
  ];

  const stats = {
    total: posts?.length || 0,
    draft: posts?.filter(p => p.status === 'draft').length || 0,
    in_review: posts?.filter(p => p.status === 'in_review').length || 0,
    scheduled: posts?.filter(p => p.status === 'scheduled').length || 0,
    published: posts?.filter(p => p.status === 'published').length || 0,
    archived: posts?.filter(p => p.status === 'archived').length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage blog posts, categories, and publishing workflow</p>
          {((postsError as any)?.code === '42P01' || (categoriesError as any)?.code === '42P01' || (seriesError as any)?.code === '42P01') && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Setup Required:</strong> Database tables need to be created. See instructions below.
              </p>
            </div>
          )}
        </div>
        <Button onClick={() => setEditingPost({
          title: '',
          subtitle: '',
          slug: '',
          excerpt: '',
          cover_image_url: '',
          cover_alt: '',
          cover_caption: '',
          body_md: '',
          category: 'general',
          tags: [],
          authors: [],
          series_key: null,
          series_order: null,
          locale: 'en',
          featured: false,
          pinned: false,
          comments_enabled: true,
          status: 'draft',
          visibility: 'public',
          publish_at_utc: null,
          seo_title: '',
          seo_description: '',
          canonical_url: '',
          og_image_url: '',
          created_by: user?.id || '',
          updated_by: user?.id || ''
        } as BlogPostInsert)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.in_review}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.slug} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Locale</Label>
              <Select value={localeFilter} onValueChange={setLocaleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locales</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={posts || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search blog posts..."
        emptyMessage={
          (postsError as any)?.code === '42P01' 
            ? "Database tables not found. Please run the migration first."
            : "No blog posts found"
        }
      />

      {/* Database Setup Message */}
      {((postsError as any)?.code === '42P01' || (categoriesError as any)?.code === '42P01' || (seriesError as any)?.code === '42P01') && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              The blog system database tables haven't been created yet. To get started:
            </p>
            <div className="space-y-2 text-sm text-yellow-600">
              <p>1. Run the migration: <code className="bg-yellow-100 px-2 py-1 rounded">supabase migration up</code></p>
              <p>2. Or manually create the required tables (blog_posts, blog_categories, blog_series)</p>
              <p>3. Refresh this page after setup</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Post Dialog */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSavePost} className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingPost.id ? 'Edit Post' : 'New Post'}
                </h2>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </Button>
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="publishing">Publishing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        name="title"
                        defaultValue={editingPost.title || ''}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        name="subtitle"
                        defaultValue={editingPost.subtitle || ''}
                        maxLength={140}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        name="slug"
                        defaultValue={editingPost.slug || ''}
                        required
                        pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" defaultValue={editingPost.category || 'general'} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.slug} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt * (120-160 characters)</Label>
                    <Textarea
                      name="excerpt"
                      defaultValue={editingPost.excerpt || ''}
                      rows={3}
                      required
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {editingPost.excerpt?.length || 0}/160 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cover_image_url">Cover Image URL</Label>
                      <Input
                        name="cover_image_url"
                        defaultValue={editingPost.cover_image_url || ''}
                        type="url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cover_alt">Cover Alt Text *</Label>
                      <Input
                        name="cover_alt"
                        defaultValue={editingPost.cover_alt || ''}
                        required
                        maxLength={140}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="body_md">Body Content * (Markdown)</Label>
                    <Textarea
                      name="body_md"
                      defaultValue={editingPost.body_md || ''}
                      rows={15}
                      required
                      minLength={300}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {editingPost.body_md?.length || 0} characters (minimum 300)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags * (comma-separated)</Label>
                      <Input
                        name="tags"
                        defaultValue={editingPost.tags?.join(', ') || ''}
                        placeholder="bioinformatics, data science, genomics"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="authors">Authors * (comma-separated)</Label>
                      <Input
                        name="authors"
                        defaultValue={editingPost.authors?.join(', ') || ''}
                        required
                        placeholder="John Doe, Jane Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="series_key">Series</Label>
                      <Select name="series_key" defaultValue={editingPost.series_key || 'none'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select series" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No series</SelectItem>
                          {series?.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="series_order">Series Order</Label>
                      <Input
                        name="series_order"
                        type="number"
                        defaultValue={editingPost.series_order || ''}
                        min="1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="seo_title">SEO Title (max 60 chars)</Label>
                      <Input
                        name="seo_title"
                        defaultValue={editingPost.seo_title || ''}
                        maxLength={60}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seo_description">SEO Description (max 160 chars)</Label>
                      <Textarea
                        name="seo_description"
                        defaultValue={editingPost.seo_description || ''}
                        rows={3}
                        maxLength={160}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="canonical_url">Canonical URL</Label>
                      <Input
                        name="canonical_url"
                        defaultValue={editingPost.canonical_url || ''}
                        type="url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="og_image_url">OG Image URL</Label>
                      <Input
                        name="og_image_url"
                        defaultValue={editingPost.og_image_url || ''}
                        type="url"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="publishing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select name="status" defaultValue={editingPost.status || 'draft'} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="visibility">Visibility *</Label>
                      <Select name="visibility" defaultValue={editingPost.visibility || 'public'} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publish_at_utc">Publish At (UTC)</Label>
                      <Input
                        name="publish_at_utc"
                        type="datetime-local"
                        defaultValue={editingPost.publish_at_utc ? editingPost.publish_at_utc.slice(0, 16) : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="locale">Locale *</Label>
                      <Select name="locale" defaultValue={editingPost.locale || 'en'} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      name="featured"
                      defaultChecked={editingPost.featured || false}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      name="pinned"
                      defaultChecked={editingPost.pinned || false}
                    />
                    <Label htmlFor="pinned">Pinned Post</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      name="comments_enabled"
                      defaultChecked={editingPost.comments_enabled !== false}
                    />
                    <Label htmlFor="comments_enabled">Enable Comments</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save Post'}
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
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(postToDelete!.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
