import { supabase } from '@/lib/supabase/browser';

export interface PortfolioFilters {
  search?: string;
  service?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

export const getPublishedProjects = async (filters: PortfolioFilters = {}) => {
  const { search = '', service, country, limit = 12, offset = 0 } = filters;
  
  try {
    let query = supabase
      .from('portfolio_projects')
      .select(`
        *,
        portfolio_images!inner(url, alt, is_cover, "order")
      `)
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    if (service) {
      query = query.contains('services', [service]);
    }
    
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching portfolio projects:', error);
      return [];
    }
    
    return data ?? [];
  } catch (error) {
    console.error('Error in getPublishedProjects:', error);
    return [];
  }
};

export const getProjectBySlug = async (slug: string) => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return null;
    }

    const [{ data: images }, { data: files }] = await Promise.all([
      supabase
        .from('portfolio_images')
        .select('*')
        .eq('project_id', project.id)
        .order('order', { ascending: true }),
      supabase
        .from('portfolio_files')
        .select('*')
        .eq('project_id', project.id),
    ]);

    return { 
      project, 
      images: images ?? [], 
      files: files ?? [] 
    };
  } catch (error) {
    console.error('Error in getProjectBySlug:', error);
    return null;
  }
};

export const getRelatedProjects = async (currentProjectId: string, services: string[], limit = 3) => {
  try {
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

    if (error) {
      console.error('Error fetching related projects:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getRelatedProjects:', error);
    return [];
  }
};