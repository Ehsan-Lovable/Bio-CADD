-- Comprehensive Schema Refresh Solution (Transaction-Safe)
-- This migration addresses persistent relationship detection issues in Supabase schema cache

-- 1. Ensure proper foreign key relationships exist
DO $$
BEGIN
    -- Add course_id foreign key if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'certificates' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'course_id'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT certificates_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id);
    END IF;
    
    -- Add batch_id foreign key if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'certificates' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'batch_id'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT certificates_batch_id_fkey 
        FOREIGN KEY (batch_id) REFERENCES public.course_batches(id);
    END IF;
    
    -- Add user_id foreign key if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'certificates' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT certificates_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Update table statistics (transaction-safe)
ANALYZE public.certificates;
ANALYZE public.courses;
ANALYZE public.course_batches;
ANALYZE public.profiles;

-- 3. Force Supabase schema cache invalidation through table modifications
COMMENT ON TABLE public.certificates IS 'Certificate records - relationships verified and cache refreshed';
COMMENT ON TABLE public.courses IS 'Course records - schema relationships verified';
COMMENT ON TABLE public.course_batches IS 'Course batch records - schema relationships verified';
COMMENT ON TABLE public.profiles IS 'Profile records - schema relationships verified';

-- Update column comments to trigger deeper cache refresh
COMMENT ON COLUMN public.certificates.course_id IS 'Foreign key to courses table - relationship verified';
COMMENT ON COLUMN public.certificates.batch_id IS 'Foreign key to course_batches table - relationship verified';
COMMENT ON COLUMN public.certificates.user_id IS 'Foreign key to profiles table - relationship verified';

-- 4. Add schema version tracking
CREATE TABLE IF NOT EXISTS public.schema_versions (
    id SERIAL PRIMARY KEY,
    version_name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

-- Record this comprehensive refresh
INSERT INTO public.schema_versions (version_name, description) 
VALUES ('comprehensive_schema_refresh_v2', 'Applied comprehensive schema refresh to resolve persistent relationship detection issues - transaction safe version');

-- 5. Create monitoring function to detect relationship issues
CREATE OR REPLACE FUNCTION public.verify_schema_relationships()
RETURNS TABLE(
    table_name TEXT,
    column_name TEXT,
    foreign_table TEXT,
    constraint_count BIGINT,
    status TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        tc.table_name::TEXT,
        kcu.column_name::TEXT,
        ccu.table_name::TEXT as foreign_table,
        COUNT(*) as constraint_count,
        CASE 
            WHEN COUNT(*) = 1 THEN 'OK'
            WHEN COUNT(*) > 1 THEN 'DUPLICATE_CONSTRAINTS'
            ELSE 'MISSING_CONSTRAINT'
        END as status
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('certificates', 'courses', 'course_batches', 'profiles')
    GROUP BY tc.table_name, kcu.column_name, ccu.table_name
    ORDER BY tc.table_name, kcu.column_name;
$$;

-- 6. Create helper function to force schema refresh when needed
CREATE OR REPLACE FUNCTION public.force_schema_cache_refresh()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE pg_class SET reltuples = reltuples WHERE relname IN ('certificates', 'courses', 'course_batches', 'profiles');
    SELECT 'Schema cache refresh triggered at ' || NOW()::TEXT;
$$;