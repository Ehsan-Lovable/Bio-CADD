-- Fix critical security vulnerability in enrollment_form_fields table
-- Currently anyone can read active form fields, exposing student data structure

-- First, drop the overly permissive policy that allows anyone to read form fields
DROP POLICY IF EXISTS "Anyone can read active form fields" ON public.enrollment_form_fields;

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

-- Add comment documenting the security fix
COMMENT ON POLICY "Authenticated users can read active form fields" ON public.enrollment_form_fields 
IS 'Restricts form field access to authenticated users only to protect student data privacy';

COMMENT ON POLICY "Block anonymous access to enrollment form fields" ON public.enrollment_form_fields 
IS 'Explicitly blocks all anonymous access to prevent exposure of student enrollment data structure';