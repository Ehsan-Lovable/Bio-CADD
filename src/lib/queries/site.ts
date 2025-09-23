import { supabase } from '@/integrations/supabase/client';

export const getSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSiteSettings:', error);
    return null;
  }
};

export const getMetrics = async () => {
  const settings = await getSiteSettings();
  return settings?.metrics ?? [];
};

export const getPartners = async () => {
  const settings = await getSiteSettings();
  return settings?.partners ?? [];
};