import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioFilterBar } from '@/components/PortfolioFilterBar';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProjectCardSkeleton } from '@/components/site/LoadingSkeletons';
import { getPublishedProjects } from '@/lib/queries/portfolio';
import { SEOHead } from '@/components/SEOHead';
import { Header } from '@/components/Header';
import { BioinformaticsServicesSection } from '@/components/BioinformaticsServicesSection';
import { ServicesMarquee } from '@/components/ServicesMarquee';

import { toast } from 'sonner';

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  country?: string;
  duration_text?: string;
  services: string[];
  technologies: string[];
  featured: boolean;
  hero_image_url?: string;
  created_at: string;
  portfolio_images: Array<{
    url: string;
    alt?: string;
    is_cover: boolean;
    order: number;
  }>;
}

interface FilterState {
  search: string;
  services: string;
  country: string;
  sort: 'newest' | 'oldest' | 'a-z' | 'z-a';
}

export function PortfolioList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    services: searchParams.get('services') || '',
    country: searchParams.get('country') || '',
    sort: (searchParams.get('sort') as 'newest' | 'oldest' | 'a-z' | 'z-a') || 'newest',
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.services) params.set('services', filters.services);
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
        
        const data = await getPublishedProjects({
          search: filters.search,
          service: filters.services || undefined,
          country: filters.country || undefined,
          limit: 50, // Fetch more projects for client-side filtering
        });
        
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load portfolio projects');
        toast.error('Failed to load portfolio projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters.search, filters.services, filters.country]);

  // Get unique options for filters
  const { serviceOptions, countryOptions } = useMemo(() => {
    const services = new Set<string>();
    const countries = new Set<string>();

    projects.forEach(project => {
      (project.services || []).forEach(service => services.add(service));
      if (project.country) countries.add(project.country);
    });

    return {
      serviceOptions: Array.from(services).sort(),
      countryOptions: Array.from(countries).sort(),
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply sorting
    if (filters.sort === 'a-z') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sort === 'z-a') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (filters.sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [projects, filters.sort]);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getCoverImage = (project: PortfolioProject) => {
    if (project.hero_image_url) return project.hero_image_url;
    
    const coverImage = project.portfolio_images?.find(img => img.is_cover);
    if (coverImage) return coverImage.url;
    
    const firstImage = project.portfolio_images?.[0];
    return firstImage?.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Portfolio - Loading..."
          description="Loading our portfolio of projects"
        />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Our Portfolio - Innovative Projects & Digital Solutions"
          description="Explore our portfolio of successful projects, from web applications to digital solutions. See how we've helped clients achieve their goals."
          type="website"
          tags={['portfolio', 'projects', 'web development', 'digital solutions', 'case studies']}
        />

        <Header />

        {/* Bioinformatics & CADD Services Section */}
        <BioinformaticsServicesSection />

        {/* Services Marquee */}
        <ServicesMarquee />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background to-accent/20 py-20 border-b">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="text-primary">Portfolio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the innovative projects we've delivered for clients worldwide. 
              From cutting-edge web applications to comprehensive digital solutions.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Filter Bar */}
          <div className="mb-8">
            <PortfolioFilterBar
              filters={{
                search: filters.search,
                services: [filters.services].filter(Boolean),
                country: filters.country,
                sort: filters.sort
              }}
              onFiltersChange={(newFilters) => handleFiltersChange({
                search: newFilters.search,
                services: newFilters.services?.[0] || '',
                country: newFilters.country,
                sort: newFilters.sort
              })}
              serviceOptions={serviceOptions}
              countryOptions={countryOptions}
            />
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!error && filteredProjects.length === 0 && (
            <EmptyState
              title="No projects found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              action={{
                label: "Clear Filters",
                onClick: () => setFilters({
                  search: '',
                  services: '',
                  country: '',
                  sort: 'newest',
                })
              }}
            />
          )}

          {/* Projects Grid */}
          {!error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <PortfolioCard
                  key={project.id}
                  project={{
                    id: project.id,
                    title: project.title,
                    summary: project.summary || '',
                    services: project.services || [],
                    country: project.country,
                    duration_text: project.duration_text,
                    slug: project.slug,
                    featured: project.featured,
                    hero_image_url: getCoverImage(project)
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}