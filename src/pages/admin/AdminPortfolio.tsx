import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { LoadingState } from '@/components/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import AdminPortfolioForm from './AdminPortfolioForm';

interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  country?: string;
  services: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  updated_at: string;
}

function AdminPortfolioList() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id, slug, title, client_name, country, services, status, featured, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio project deleted successfully',
      });

      fetchProjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio project',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'title' as keyof PortfolioProject,
      header: 'Title',
      render: (value: any, row: PortfolioProject) => (
        <div>
          <div className="font-medium">{row.title}</div>
          {row.client_name && (
            <div className="text-sm text-muted-foreground">
              Client: {row.client_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'country' as keyof PortfolioProject,
      header: 'Country',
      render: (value: any) => value || '-',
    },
    {
      key: 'services' as keyof PortfolioProject,
      header: 'Services',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((service: string) => (
            <Badge key={service} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {(value?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status' as keyof PortfolioProject,
      header: 'Status',
      render: (value: any, row: PortfolioProject) => {
        const variant = value === 'published' ? 'default' : 
                      value === 'draft' ? 'secondary' : 'outline';
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant} className="capitalize">
              {value}
            </Badge>
            {row.featured && (
              <Badge variant="outline" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'updated_at' as keyof PortfolioProject,
      header: 'Updated',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row: PortfolioProject) => navigate(`/admin/portfolio/${row.id}`),
    },
    {
      label: 'View Public',
      onClick: (row: PortfolioProject) => window.open(`/portfolio/${row.slug}`, '_blank'),
    },
    {
      label: 'Delete',
      onClick: (row: PortfolioProject) => setDeleteId(row.id),
      variant: 'destructive' as const,
    },
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Projects</h1>
          <p className="text-muted-foreground">
            Manage your portfolio of bioinformatics and computational biology projects
          </p>
        </div>
        <Button onClick={() => navigate('/admin/portfolio/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={projects}
            actions={actions}
            searchPlaceholder="Search projects..."
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Portfolio Project"
        description="Are you sure you want to delete this portfolio project? This action cannot be undone."
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}

export default function AdminPortfolio() {
  return (
    <Routes>
      <Route index element={<AdminPortfolioList />} />
      <Route path="new" element={<AdminPortfolioForm />} />
      <Route path=":id" element={<AdminPortfolioForm />} />
    </Routes>
  );
}