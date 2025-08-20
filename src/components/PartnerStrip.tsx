import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Partner {
  name: string;
  logo_url?: string;
}

interface PartnerStripProps {
  partners?: Partner[];
  title?: string;
  className?: string;
}

export const PartnerStrip = ({ 
  partners: customPartners, 
  title = "Trusted by leading companies",
  className 
}: PartnerStripProps) => {
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ['site-settings-partners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('partners')
        .eq('id', 1)
        .single();
      return data;
    },
    enabled: !customPartners
  });

  if (isLoading && !customPartners) {
    return (
      <section className={`py-16 px-6 bg-muted/30 ${className || ''}`}>
        <div className="max-w-6xl mx-auto text-center">
          <Skeleton className="h-6 w-48 mx-auto mb-8" />
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const partners = customPartners || 
    (Array.isArray(siteSettings?.partners) ? siteSettings.partners : []);

  if (partners.length === 0) return null;

  return (
    <section className={`py-16 px-6 bg-muted/30 ${className || ''}`}>
      <div className="max-w-6xl mx-auto text-center">
        {title && (
          <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wide">
            {title}
          </p>
        )}
        <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
          {partners.map((partner: any, index: number) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all hover:opacity-100">
              {partner.logo_url ? (
                <img 
                  src={partner.logo_url} 
                  alt={partner.name || `Partner ${index + 1}`}
                  className="h-12 object-contain"
                />
              ) : (
                <div className="h-12 px-6 bg-muted rounded flex items-center">
                  <span className="font-medium">{partner.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};