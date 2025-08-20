import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { StringRepeatableList } from '@/components/RepeatableList';
import { toast } from 'sonner';

interface SiteSettings {
  id: number;
  hero_headline: string;
  hero_subtitle: string;
  hero_cta_label: string;
  metrics: any[];
  partners: any[];
}

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState<SiteSettings>({
    id: 1,
    hero_headline: '',
    hero_subtitle: '',
    hero_cta_label: '',
    metrics: [],
    partners: []
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          id: data.id,
          hero_headline: data.hero_headline || '',
          hero_subtitle: data.hero_subtitle || '',
          hero_cta_label: data.hero_cta_label || '',
          metrics: Array.isArray(data.metrics) ? data.metrics : [],
          partners: Array.isArray(data.partners) ? data.partners : []
        });
      }
      
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (settingsData: Partial<SiteSettings>) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          ...settingsData,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Site settings saved successfully');
      setIsDirty(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save settings');
    }
  });

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <Button 
          onClick={handleSave} 
          disabled={!isDirty || saveMutation.isPending}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero_headline">Headline</Label>
              <Input
                id="hero_headline"
                value={formData.hero_headline}
                onChange={(e) => handleInputChange('hero_headline', e.target.value)}
                placeholder="Main headline for hero section"
              />
            </div>
            
            <div>
              <Label htmlFor="hero_subtitle">Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={formData.hero_subtitle}
                onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                placeholder="Supporting text for hero section"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="hero_cta_label">CTA Button Text</Label>
              <Input
                id="hero_cta_label"
                value={formData.hero_cta_label}
                onChange={(e) => handleInputChange('hero_cta_label', e.target.value)}
                placeholder="Browse Courses"
              />
            </div>
          </div>
        </Card>

        {/* Metrics/Features */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure the features displayed in the feature grid. Add feature titles and descriptions.
          </p>
          <div className="space-y-4">
            {formData.metrics.map((metric: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <Label>Feature {index + 1} - Title</Label>
                  <Input
                    value={metric.title || ''}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index] = { ...metric, title: e.target.value };
                      handleInputChange('metrics', newMetrics);
                    }}
                    placeholder="Feature title"
                  />
                </div>
                <div>
                  <Label>Feature {index + 1} - Description</Label>
                  <Textarea
                    value={metric.description || ''}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index] = { ...metric, description: e.target.value };
                      handleInputChange('metrics', newMetrics);
                    }}
                    placeholder="Feature description"
                    rows={2}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newMetrics = formData.metrics.filter((_, i) => i !== index);
                    handleInputChange('metrics', newMetrics);
                  }}
                >
                  Remove Feature
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={() => {
                const newMetrics = [...formData.metrics, { title: '', description: '' }];
                handleInputChange('metrics', newMetrics);
              }}
            >
              Add Feature
            </Button>
          </div>
        </Card>

        {/* Partners */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Partners</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure the partners displayed in the partner strip. Add partner names and logo URLs.
          </p>
          <div className="space-y-4">
            {formData.partners.map((partner: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <Label>Partner {index + 1} - Name</Label>
                  <Input
                    value={partner.name || ''}
                    onChange={(e) => {
                      const newPartners = [...formData.partners];
                      newPartners[index] = { ...partner, name: e.target.value };
                      handleInputChange('partners', newPartners);
                    }}
                    placeholder="Partner name"
                  />
                </div>
                <div>
                  <Label>Partner {index + 1} - Logo URL</Label>
                  <Input
                    value={partner.logo_url || ''}
                    onChange={(e) => {
                      const newPartners = [...formData.partners];
                      newPartners[index] = { ...partner, logo_url: e.target.value };
                      handleInputChange('partners', newPartners);
                    }}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newPartners = formData.partners.filter((_, i) => i !== index);
                    handleInputChange('partners', newPartners);
                  }}
                >
                  Remove Partner
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={() => {
                const newPartners = [...formData.partners, { name: '', logo_url: '' }];
                handleInputChange('partners', newPartners);
              }}
            >
              Add Partner
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}