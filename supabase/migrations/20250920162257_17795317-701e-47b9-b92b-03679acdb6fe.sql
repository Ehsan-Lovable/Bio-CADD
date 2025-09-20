-- Fix critical security vulnerability in enrollment_form_fields table
-- Drop the existing overly permissive policy and replace with secure ones

-- Drop the current insecure policy
DROP POLICY IF EXISTS "Anyone can read active form fields" ON public.enrollment_form_fields;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Authenticated users can read active form fields" ON public.enrollment_form_fields;
DROP POLICY IF EXISTS "Block anonymous access to enrollment form fields" ON public.enrollment_form_fields;

-- Create a secure policy that requires authentication to view form fields
CREATE POLICY "Authenticated users can read active form fields"
ON public.enrollment_form_fields
FOR SELECT
TO authenticated
USING (is_active = true);

-- Add explicit anonymous blocking policy for extra security
CREATE POLICY "Block anonymous access to enrollment form fields"
ON public.enrollment_form_fields
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add comments documenting the security fix
COMMENT ON POLICY "Authenticated users can read active form fields" ON public.enrollment_form_fields 
IS 'Restricts form field access to authenticated users only to protect student data privacy';

COMMENT ON POLICY "Block anonymous access to enrollment form fields" ON public.enrollment_form_fields 
IS 'Explicitly blocks all anonymous access to prevent exposure of student enrollment data structure';