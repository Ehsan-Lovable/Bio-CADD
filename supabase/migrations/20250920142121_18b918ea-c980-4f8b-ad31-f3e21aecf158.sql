-- Fix RLS policies for enrollment_submissions table to ensure proper access control
-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Admins can manage all enrollment submissions" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Admins can read all enrollment submissions" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Secure enrollment submission creation" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Users can read own enrollment submissions" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Users can update own enrollment submissions" ON public.enrollment_submissions;

-- Create new, more secure RLS policies
-- Policy for users to create their own enrollment submissions
CREATE POLICY "Users can create own enrollment submissions"
ON public.enrollment_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND course_id IS NOT NULL 
  AND form_data IS NOT NULL 
  AND jsonb_typeof(form_data) = 'object'
);

-- Policy for users to read only their own enrollment submissions
CREATE POLICY "Users can read own enrollment submissions"
ON public.enrollment_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to update only their own enrollment submissions
-- but only specific fields and only if not yet reviewed
CREATE POLICY "Users can update own enrollment submissions"
ON public.enrollment_submissions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'submitted'
  AND reviewed_at IS NULL
)
WITH CHECK (
  auth.uid() = user_id
);

-- Policy for admins to have full access
CREATE POLICY "Admins can manage all enrollment submissions"
ON public.enrollment_submissions
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Ensure RLS is enabled
ALTER TABLE public.enrollment_submissions ENABLE ROW LEVEL SECURITY;

-- Add additional security: prevent public/anonymous access
CREATE POLICY "Block anonymous access to enrollment submissions"
ON public.enrollment_submissions
FOR ALL
TO anon
USING (false);