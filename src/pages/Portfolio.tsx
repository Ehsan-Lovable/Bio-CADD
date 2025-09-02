import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PortfolioFilterBar } from '@/components/PortfolioFilterBar';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { BioinformaticsServicesSection } from '@/components/BioinformaticsServicesSection';
import { ServicesMarquee } from '@/components/ServicesMarquee';
import { Button } from '@/components/ui/button';

import { supabase } from '@/integrations/supabase/client';
import { FileText, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
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

  // Separate featured projects for spotlight
  const featuredProjects = projects.filter(project => project.featured);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <SEOHead
        title="Portfolio - Bioinformatics & Computational Biology Case Studies"
        description="Explore our portfolio of bioinformatics and computational biology projects, showcasing genomics, proteomics, drug discovery, and data analysis solutions."
      />

      <div className="min-h-screen bg-background">
        {/* Bioinformatics & CADD Services Section */}
        <BioinformaticsServicesSection />

        {/* Services Marquee */}
        <ServicesMarquee />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[60vh] flex items-center">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(124,58,237,0.3),transparent_50%)] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.3),transparent_50%)] opacity-40" />
          
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse" />
          </div>
          
          <div className="relative container mx-auto px-6 py-20">
            <motion.div 
              className="max-w-5xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/20 rounded-full px-6 py-2 mb-8"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Premium Case Studies</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Our{" "}
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Portfolio
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Discover how we transform complex biological data into actionable insights through 
                cutting-edge{" "}
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold">
                  bioinformatics
                </span>{" "}
                and{" "}
                <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
                  computational approaches
                </span>.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <div className="text-sm text-slate-400 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
                  <span className="font-medium text-white">{projects.length}</span> Success Stories
                </div>
                <div className="text-sm text-slate-400 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
                  <span className="font-medium text-white">{featuredProjects.length}</span> Featured Projects
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Featured Projects Spotlight */}
        {featuredProjects.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full px-6 py-2 mb-6">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Featured Projects</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                  Showcase Excellence
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                  Highlighting our most impactful bioinformatics projects and breakthrough research collaborations
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {featuredProjects.slice(0, 6).map((project, index) => (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    className="flex-none w-80 md:w-96"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <PortfolioCard
                      project={project}
                      className="h-full transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="container mx-auto px-6 py-16">
          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <PortfolioFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              serviceOptions={serviceOptions}
              countryOptions={countryOptions}
            />
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredProjects.length}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{projects.length}</span> projects
              </p>
              <div className="h-px bg-gradient-to-r from-purple-500 to-blue-500 flex-1 ml-8" />
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-destructive mb-4">
                <FileText className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold">Error Loading Projects</h3>
                <p className="text-slate-600 dark:text-slate-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!error && !loading && filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16"
            >
              <EmptyState
                icon={Briefcase}
                title="No projects found"
                description={
                  projects.length === 0
                    ? "No portfolio projects have been published yet."
                    : "Try adjusting your filters to find more projects."
                }
              />
            </motion.div>
          )}

          {/* Projects Grid */}
          {!error && filteredProjects.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PortfolioCard
                    project={project}
                    className="h-full transform transition-all duration-300 hover:shadow-xl"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="relative container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Ready to accelerate your research with{" "}
                <span className="text-yellow-300">BioGenius</span> expertise?
              </h2>
              <p className="text-xl text-purple-100 mb-10 leading-relaxed">
                Join leading researchers and institutions who trust us to deliver exceptional bioinformatics solutions
              </p>
              <Button 
                size="lg"
                className="group bg-white text-purple-700 hover:bg-yellow-300 hover:text-purple-800 font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}