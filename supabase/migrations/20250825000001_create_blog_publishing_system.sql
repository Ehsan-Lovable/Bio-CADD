-- Create blog publishing system tables
-- Based on Admin Blog Publishing Specification v1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL CHECK (char_length(excerpt) BETWEEN 120 AND 160),
    cover_image_url TEXT,
    cover_alt TEXT NOT NULL CHECK (char_length(cover_alt) <= 140),
    cover_caption TEXT CHECK (char_length(cover_caption) <= 200),
    body_md TEXT NOT NULL CHECK (char_length(body_md) >= 300),
    reading_time INTEGER,
    word_count INTEGER,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL CHECK (array_length(tags, 1) BETWEEN 1 AND 10),
    authors TEXT[] NOT NULL CHECK (array_length(authors, 1) >= 1),
    series_key TEXT,
    series_order INTEGER,
    references JSONB,
    cta_label TEXT,
    cta_url TEXT,
    seo_title TEXT CHECK (char_length(seo_title) <= 60),
    seo_description TEXT CHECK (char_length(seo_description) <= 160),
    canonical_url TEXT,
    og_image_url TEXT,
    featured BOOLEAN DEFAULT false,
    pinned BOOLEAN DEFAULT false,
    comments_enabled BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
    publish_at_utc TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'bn')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_post_revisions table
CREATE TABLE IF NOT EXISTS blog_post_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    diff JSONB NOT NULL,
    snapshot JSONB NOT NULL,
    editor_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_audit_log table
CREATE TABLE IF NOT EXISTS blog_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    post_id UUID REFERENCES blog_posts(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES blog_categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_series table
CREATE TABLE IF NOT EXISTS blog_series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_media table
CREATE TABLE IF NOT EXISTS blog_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_url TEXT NOT NULL,
    processed_urls JSONB,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    post_id UUID REFERENCES blog_posts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_visibility ON blog_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_at ON blog_posts(publish_at_utc);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_authors ON blog_posts USING GIN(authors);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON blog_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_by ON blog_posts(updated_by);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at ON blog_posts(updated_at);

CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(subtitle, '') || ' ' || excerpt || ' ' || body_md));

CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_post_id ON blog_post_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_editor_id ON blog_post_revisions(editor_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_revisions_created_at ON blog_post_revisions(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_audit_log_actor_id ON blog_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_blog_audit_log_post_id ON blog_audit_log(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_audit_log_action ON blog_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_blog_audit_log_created_at ON blog_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_media_uploaded_by ON blog_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_blog_media_post_id ON blog_media(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_media_created_at ON blog_media(created_at);

-- Create functions for computed fields
CREATE OR REPLACE FUNCTION calculate_reading_time(body_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Estimate reading time: 200 words per minute
    RETURN GREATEST(1, CEIL(char_length(body_text) / 1000.0 * 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_word_count(body_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Simple word count by spaces
    RETURN array_length(regexp_split_to_array(trim(body_text), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at_column();

CREATE TRIGGER update_blog_series_updated_at
    BEFORE UPDATE ON blog_series
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at_column();

CREATE TRIGGER update_blog_media_updated_at
    BEFORE UPDATE ON blog_media
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at_column();

-- Create function to automatically calculate reading_time and word_count
CREATE OR REPLACE FUNCTION update_blog_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time = calculate_reading_time(NEW.body_md);
    NEW.word_count = calculate_word_count(NEW.body_md);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic metrics calculation
CREATE TRIGGER update_blog_post_metrics_trigger
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_post_metrics();

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_blog_audit_event(
    actor_uuid UUID,
    action_text TEXT,
    post_uuid UUID DEFAULT NULL,
    metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO blog_audit_log (actor_id, action, post_id, metadata)
    VALUES (actor_uuid, action_text, post_uuid, metadata_json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create revision on post update
CREATE OR REPLACE FUNCTION create_blog_post_revision()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create revision if content actually changed
    IF OLD.body_md != NEW.body_md OR OLD.title != NEW.title OR OLD.excerpt != NEW.excerpt THEN
        INSERT INTO blog_post_revisions (post_id, diff, snapshot, editor_id)
        VALUES (
            NEW.id,
            jsonb_build_object(
                'title', jsonb_build_object('old', OLD.title, 'new', NEW.title),
                'excerpt', jsonb_build_object('old', OLD.excerpt, 'new', NEW.excerpt),
                'body_md', jsonb_build_object('old', OLD.body_md, 'new', NEW.body_md)
            ),
            to_jsonb(NEW.*),
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic revision creation
CREATE TRIGGER create_blog_post_revision_trigger
    AFTER UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION create_blog_post_revision();

-- Create function to validate post before publishing
CREATE OR REPLACE FUNCTION validate_blog_post_for_publishing(post_uuid UUID)
RETURNS TABLE(is_valid BOOLEAN, errors TEXT[]) AS $$
DECLARE
    post_record RECORD;
    error_list TEXT[] := '{}';
    is_valid BOOLEAN := true;
BEGIN
    SELECT * INTO post_record FROM blog_posts WHERE id = post_uuid;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, ARRAY['Post not found'];
        RETURN;
    END IF;
    
    -- Check required fields
    IF post_record.title IS NULL OR trim(post_record.title) = '' THEN
        error_list := array_append(error_list, 'Title is required');
        is_valid := false;
    END IF;
    
    IF post_record.slug IS NULL OR trim(post_record.slug) = '' THEN
        error_list := array_append(error_list, 'Slug is required');
        is_valid := false;
    END IF;
    
    IF post_record.excerpt IS NULL OR trim(post_record.excerpt) = '' THEN
        error_list := array_append(error_list, 'Excerpt is required');
        is_valid := false;
    END IF;
    
    IF post_record.body_md IS NULL OR trim(post_record.body_md) = '' THEN
        error_list := array_append(error_list, 'Body content is required');
        is_valid := false;
    END IF;
    
    IF post_record.category IS NULL OR trim(post_record.category) = '' THEN
        error_list := array_append(error_list, 'Category is required');
        is_valid := false;
    END IF;
    
    IF post_record.tags IS NULL OR array_length(post_record.tags, 1) = 0 THEN
        error_list := array_append(error_list, 'At least one tag is required');
        is_valid := false;
    END IF;
    
    IF post_record.authors IS NULL OR array_length(post_record.authors, 1) = 0 THEN
        error_list := array_append(error_list, 'At least one author is required');
        is_valid := false;
    END IF;
    
    -- Check excerpt length
    IF char_length(post_record.excerpt) < 120 OR char_length(post_record.excerpt) > 160 THEN
        error_list := array_append(error_list, 'Excerpt must be between 120 and 160 characters');
        is_valid := false;
    END IF;
    
    -- Check body minimum length
    IF char_length(post_record.body_md) < 300 THEN
        error_list := array_append(error_list, 'Body content must be at least 300 characters');
        is_valid := false;
    END IF;
    
    -- Check cover image for public posts
    IF post_record.visibility = 'public' AND (post_record.cover_image_url IS NULL OR trim(post_record.cover_image_url) = '') THEN
        error_list := array_append(error_list, 'Cover image is required for public posts');
        is_valid := false;
    END IF;
    
    -- Check cover alt text
    IF post_record.cover_image_url IS NOT NULL AND (post_record.cover_alt IS NULL OR trim(post_record.cover_alt) = '') THEN
        error_list := array_append(error_list, 'Cover alt text is required when cover image is present');
        is_valid := false;
    END IF;
    
    RETURN QUERY SELECT is_valid, error_list;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Users can view published posts" ON blog_posts
    FOR SELECT USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Authors can manage their own posts" ON blog_posts
    FOR ALL USING (auth.jwt() ->> 'email' = ANY(authors));

CREATE POLICY "Editors can manage all posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('editor', 'admin')
        )
    );

CREATE POLICY "Admins can manage all posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for other tables
CREATE POLICY "Users can view categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage categories" ON blog_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('editor', 'admin')
        )
    );

CREATE POLICY "Users can view series" ON blog_series
    FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage series" ON blog_series
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('editor', 'admin')
        )
    );

CREATE POLICY "Users can view media" ON blog_media
    FOR SELECT USING (true);

CREATE POLICY "Users can upload media" ON blog_media
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own media" ON blog_media
    FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "Editors and admins can manage all media" ON blog_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('editor', 'admin')
        )
    );

-- Insert sample data
INSERT INTO blog_categories (name, slug, description) VALUES
('Bioinformatics', 'bioinformatics', 'Core bioinformatics concepts and methodologies'),
('Data Science', 'data-science', 'Data analysis and machine learning in biology'),
('Genomics', 'genomics', 'Genome sequencing and analysis'),
('Healthcare', 'healthcare', 'Clinical applications and healthcare technology'),
('Research', 'research', 'Research methodologies and best practices')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_series (key, title, description) VALUES
('python-bio', 'Python for Bioinformatics', 'Learn Python programming for biological data analysis'),
('r-genomics', 'R for Genomics', 'Statistical analysis of genomic data using R'),
('ml-biology', 'Machine Learning in Biology', 'AI and ML applications in biological research')
ON CONFLICT (key) DO NOTHING;

-- Create view for published posts
CREATE VIEW published_blog_posts AS
SELECT 
    id, title, subtitle, slug, excerpt, cover_image_url, cover_alt, cover_caption,
    body_md, reading_time, word_count, category, tags, authors, series_key, series_order,
    references, cta_label, cta_url, seo_title, seo_description, canonical_url, og_image_url,
    featured, pinned, comments_enabled, status, visibility, published_at, locale,
    created_at, updated_at
FROM blog_posts 
WHERE status = 'published' 
AND visibility = 'public'
AND (publish_at_utc IS NULL OR publish_at_utc <= NOW());

-- Grant permissions
GRANT SELECT ON published_blog_posts TO anon, authenticated;
GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON blog_post_revisions TO authenticated;
GRANT ALL ON blog_audit_log TO authenticated;
GRANT ALL ON blog_categories TO authenticated;
GRANT ALL ON blog_series TO authenticated;
GRANT ALL ON blog_media TO authenticated;

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts ON blog_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(subtitle, '') || ' ' || excerpt || ' ' || body_md));
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts_bn ON blog_posts USING GIN(to_tsvector('bengali', title || ' ' || COALESCE(subtitle, '') || ' ' || excerpt || ' ' || body_md));
