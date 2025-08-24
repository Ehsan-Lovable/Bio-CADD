import React, { useState, useEffect, useMemo } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioFilterBar } from '@/components/PortfolioFilterBar';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Briefcase } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  country?: string;
  duration_text?: string;
  summary?: string;
  hero_image_url?: string;
  services: string[];
  featured: boolean;
  created_at: string;
}

interface FilterState {
  search: string;
  services: string[];
  country: string;
  sort: 'newest' | 'oldest' | 'a-z' | 'z-a';
}

export default function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    services: searchParams.get('services')?.split(',').filter(Boolean) || [],
    country: searchParams.get('country') || '',
    sort: (searchParams.get('sort') as FilterState['sort']) || 'newest',
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.services.length) params.set('services', filters.services.join(','));
    if (filters.country) params.set('country', filters.country);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('id, slug, title, client_name, country, duration_text, summary, hero_image_url, services, featured, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Get unique options for filters
  const { serviceOptions, countryOptions } = useMemo(() => {
    const services = new Set<string>();
    const countries = new Set<string>();

    projects.forEach(project => {
      project.services.forEach(service => services.add(service));
      if (project.country) countries.add(project.country);
    });

    return {
      serviceOptions: Array.from(services).sort(),
      countryOptions: Array.from(countries).sort(),
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.summary?.toLowerCase().includes(searchLower) ||
          project.client_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Services filter
      if (filters.services.length > 0) {
        const hasService = filters.services.some(service => 
          project.services.includes(service)
        );
        if (!hasService) return false;
      }

      // Country filter
      if (filters.country && project.country !== filters.country) {
        return false;
      }

      return true;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [projects, filters]);

  if (loading) return <LoadingState />;

  return (
    <>
      <SEOHead
        title="Portfolio - Bioinformatics & Computational Biology Case Studies"
        description="Explore our portfolio of bioinformatics and computational biology projects, showcasing genomics, proteomics, drug discovery, and data analysis solutions."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-black relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary))_0%,transparent_50%)] opacity-10" />
          
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Our <span className="text-primary">Portfolio</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Discover how we transform complex biological data into actionable insights through 
                cutting-edge <span className="text-primary font-medium">bioinformatics</span> and 
                <span className="text-primary font-medium"> computational approaches</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">
          {/* Filter Bar */}
          <div className="mb-8">
            <PortfolioFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              serviceOptions={serviceOptions}
              countryOptions={countryOptions}
            />
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-destructive mb-4">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Error Loading Projects</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!error && !loading && filteredProjects.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="No projects found"
              description={
                projects.length === 0
                  ? "No portfolio projects have been published yet."
                  : "Try adjusting your filters to find more projects."
              }
            />
          )}

          {/* Projects Grid */}
          {!error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}