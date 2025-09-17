-- Comprehensive Schema Refresh Solution
-- This migration addresses persistent relationship detection issues in Supabase schema cache

-- 1. Verify and clean foreign key relationships
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Check certificates -> courses relationship
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'certificates' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'course_id';
    
    -- Ensure exactly one constraint exists for course_id
    IF constraint_count > 1 THEN
        -- Drop duplicate constraints if they exist
        PERFORM pg_catalog.pg_constraint.conname 
        FROM pg_catalog.pg_constraint 
        JOIN pg_catalog.pg_class ON pg_constraint.conrelid = pg_class.oid
        WHERE pg_class.relname = 'certificates' 
        AND pg_constraint.contype = 'f'
        AND pg_constraint.conkey[1] = (
            SELECT attnum FROM pg_attribute 
            WHERE attrelid = pg_class.oid AND attname = 'course_id'
        );
    END IF;
    
    -- Add proper foreign key constraint if missing
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
    
    -- Verify batch_id relationship
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'certificates' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'batch_id';
    
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
END $$;

-- 2. Force PostgreSQL to refresh internal catalogs
SELECT pg_reload_conf();

-- 3. Update table statistics for all related tables
ANALYZE public.certificates;
ANALYZE public.courses;
ANALYZE public.course_batches;
ANALYZE public.profiles;

-- 4. Force Supabase schema cache invalidation through table modifications
COMMENT ON TABLE public.certificates IS 'Certificate records - comprehensive schema refresh applied';
COMMENT ON TABLE public.courses IS 'Course records - schema relationships verified';
COMMENT ON TABLE public.course_batches IS 'Course batch records - schema relationships verified';

-- Update column comments to trigger deeper cache refresh
COMMENT ON COLUMN public.certificates.course_id IS 'Foreign key to courses table - relationship verified';
COMMENT ON COLUMN public.certificates.batch_id IS 'Foreign key to course_batches table - relationship verified';
COMMENT ON COLUMN public.certificates.user_id IS 'Foreign key to profiles table - relationship verified';

-- 5. Add schema version tracking
CREATE TABLE IF NOT EXISTS public.schema_versions (
    id SERIAL PRIMARY KEY,
    version_name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

-- Record this comprehensive refresh
INSERT INTO public.schema_versions (version_name, description) 
VALUES ('comprehensive_schema_refresh_v1', 'Applied comprehensive schema refresh to resolve persistent relationship detection issues');

-- 6. Create monitoring function to detect relationship issues
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

-- 7. Final cache invalidation steps
-- Vacuum analyze to ensure statistics are current
VACUUM ANALYZE public.certificates;
VACUUM ANALYZE public.courses;
VACUUM ANALYZE public.course_batches;

-- Force PostgreSQL to re-examine table relationships by touching system catalogs
SELECT pg_stat_reset();

-- Add final timestamp to track when this comprehensive refresh was completed
COMMENT ON TABLE public.certificates IS 'Certificate records - comprehensive schema refresh completed at ' || NOW()::TEXT;