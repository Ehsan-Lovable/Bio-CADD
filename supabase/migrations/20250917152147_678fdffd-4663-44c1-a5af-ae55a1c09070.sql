-- Force schema refresh to resolve caching issues
-- This will trigger Supabase to regenerate the schema cache properly

-- Add a comment to force schema refresh
COMMENT ON TABLE public.certificates IS 'Certificate records for course completions - schema refresh forced';

-- Ensure all constraints are properly registered in schema
-- Re-analyze the table to update statistics
ANALYZE public.certificates;

-- Update schema version to force cache invalidation
COMMENT ON COLUMN public.certificates.id IS 'Primary key - updated for schema refresh';