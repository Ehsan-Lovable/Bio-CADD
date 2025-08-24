-- Enum for portfolio status
CREATE TYPE portfolio_status AS ENUM ('draft','published','archived');

-- Portfolio projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  client_name text,
  country text,
  duration_text text,
  budget_text text,
  summary text,
  description_md text,
  hero_image_url text,
  services text[] DEFAULT '{}',
  technologies text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  status portfolio_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio images table
CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  "order" int DEFAULT 0,
  is_cover boolean DEFAULT false
);

-- Portfolio files table  
CREATE TABLE IF NOT EXISTS public.portfolio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  filename text,
  size_bytes bigint,
  "order" int DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_files ENABLE ROW LEVEL SECURITY;

-- Public policies for reading published content
CREATE POLICY "read published portfolio" ON public.portfolio_projects
  FOR SELECT USING (status = 'published');

CREATE POLICY "read images of published" ON public.portfolio_images
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.portfolio_projects p 
    WHERE p.id = portfolio_images.project_id AND p.status = 'published'
  ));

CREATE POLICY "read files of published" ON public.portfolio_files
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.portfolio_projects p 
    WHERE p.id = portfolio_files.project_id AND p.status = 'published'
  ));

-- Admin policies for full control
CREATE POLICY "admin manage portfolio" ON public.portfolio_projects
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles pr 
    WHERE pr.id = auth.uid() AND pr.role = 'admin'
  ));

CREATE POLICY "admin manage portfolio images" ON public.portfolio_images
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles pr 
    WHERE pr.id = auth.uid() AND pr.role = 'admin'
  ));

CREATE POLICY "admin manage portfolio files" ON public.portfolio_files
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles pr 
    WHERE pr.id = auth.uid() AND pr.role = 'admin'
  ));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-files', 'portfolio-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio images (public bucket)
CREATE POLICY "public read portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "admin upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin update portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin delete portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage policies for portfolio files (private bucket)
CREATE POLICY "admin read portfolio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'portfolio-files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin upload portfolio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin update portfolio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin delete portfolio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();