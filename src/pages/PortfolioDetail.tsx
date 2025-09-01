import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { PortfolioCard } from '@/components/PortfolioCard';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArrowLeft, MapPin, Clock, DollarSign, Download, ExternalLink, X } from 'lucide-react';

interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  country?: string;
  duration_text?: string;
  budget_text?: string;
  summary?: string;
  description_md?: string;
  hero_image_url?: string;
  services: string[];
  technologies: string[];
  featured: boolean;
  created_at: string;
}

interface PortfolioImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  is_cover: boolean;
}

interface PortfolioFile {
  id: string;
  url: string;
  filename?: string;
  size_bytes?: number;
  order: number;
}

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [files, setFiles] = useState<PortfolioFile[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main project
        const { data: projectData, error: projectError } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Project not found');

        setProject(projectData);

        // Fetch images
        const { data: imagesData, error: imagesError } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('project_id', projectData.id)
          .order('order', { ascending: true });

        if (imagesError) throw imagesError;
        setImages(imagesData || []);

        // Fetch files
        const { data: filesData, error: filesError } = await supabase
          .from('portfolio_files')
          .select('*')
          .eq('project_id', projectData.id)
          .order('order', { ascending: true });

        if (filesError) throw filesError;
        setFiles(filesData || []);

        // Fetch related projects (same services, excluding current)
        if (projectData.services.length > 0) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('portfolio_projects')
            .select('id, slug, title, client_name, country, duration_text, summary, hero_image_url, services, technologies, featured, created_at')
            .eq('status', 'published')
            .neq('id', projectData.id)
            .overlaps('services', projectData.services)
            .limit(3);

          if (!relatedError) {
            setRelatedProjects(relatedData || []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  const handleDownload = async (file: PortfolioFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('portfolio-files')
        .createSignedUrl(file.url, 3600); // 1 hour expiry

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const allImages = React.useMemo(() => {
    const galleryImages = images.filter(img => !img.is_cover);
    const coverImage = images.find(img => img.is_cover);
    
    if (project?.hero_image_url && !coverImage) {
      return [{ url: project.hero_image_url, alt: project.title }, ...galleryImages];
    }
    
    return coverImage ? [coverImage, ...galleryImages] : galleryImages;
  }, [images, project]);

  if (loading) return <LoadingState />;
  
  if (error || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <>
      <SEOHead
        title={`${project.title} - Portfolio Case Study`}
        description={project.summary || `Case study: ${project.title}`}
        image={project.hero_image_url}
      />

      <Header />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-black overflow-hidden">
          {project.hero_image_url && (
            <div className="absolute inset-0">
              <img
                src={project.hero_image_url}
                alt={project.title}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          )}
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary))_0%,transparent_50%)] opacity-10" />

          <div className="relative container mx-auto px-4 py-20">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
                <Link to="/portfolio">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portfolio
                </Link>
              </Button>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {project.title}
              </h1>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.services.map((service) => (
                  <Badge
                    key={service}
                    className="bg-primary/20 text-primary border-primary/30"
                  >
                    {service}
                  </Badge>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
                {project.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{project.country}</span>
                  </div>
                )}
                {project.duration_text && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{project.duration_text}</span>
                  </div>
                )}
                {project.budget_text && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{project.budget_text}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90">
                <Link to="/contact">
                  Start a project
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Project Summary */}
              {project.summary && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {project.summary}
                  </p>
                </div>
              )}

              {/* Case Study Content */}
              {project.description_md && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Case Study</h2>
                  <MarkdownViewer content={project.description_md} />
                </div>
              )}

              {/* Gallery */}
              {allImages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setLightboxImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downloads */}
              {files.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Downloads</h2>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <Card key={file.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{file.filename || 'Download'}</h4>
                            {file.size_bytes && (
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size_bytes)}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDownload(file)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technologies */}
              {project.technologies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technologies Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Client Info */}
              {project.client_name && (
                <Card>
                  <CardHeader>
                    <CardTitle>Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{project.client_name}</p>
                    {project.country && (
                      <p className="text-sm text-muted-foreground">{project.country}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-semibold mb-8">Related Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject) => (
                  <PortfolioCard
                    key={relatedProject.id}
                    project={relatedProject}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <img
                src={lightboxImage}
                alt="Gallery image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}