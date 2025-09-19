-- Fix RLS on schema_versions table
ALTER TABLE public.schema_versions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to schema versions
CREATE POLICY "Admins can manage schema versions" 
ON public.schema_versions 
FOR ALL 
USING (get_current_user_role() = 'admin');