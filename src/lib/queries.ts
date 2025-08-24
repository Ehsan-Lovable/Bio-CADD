import { supabase } from '@/integrations/supabase/client';

// Portfolio queries
export const getPublishedPortfolioProjects = async () => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select(`
      *,
      portfolio_images!inner(url, alt, is_cover, "order")
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getPortfolioProjectBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select(`
      *,
      portfolio_images(url, alt, is_cover, "order"),
      portfolio_files(filename, url, size_bytes)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error) throw error;
  return data;
};

export const getRelatedPortfolioProjects = async (currentProjectId: string, services: string[], limit = 3) => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select(`
      *,
      portfolio_images!inner(url, alt, is_cover)
    `)
    .eq('status', 'published')
    .neq('id', currentProjectId)
    .overlaps('services', services)
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};

// Course queries
export const getPublishedCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getCourseBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error) throw error;
  return data;
};

// Site settings
export const getSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
};

// Testimonials
export const getTestimonials = async () => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data || [];
};