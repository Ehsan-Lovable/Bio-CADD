-- Fix enrollment submissions security policies
-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can read their own submissions" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Users can create their own submissions" ON public.enrollment_submissions;
DROP POLICY IF EXISTS "Admin can manage all submissions" ON public.enrollment_submissions;

-- Create secure policies for enrollment submissions
-- Users can only read their own submissions
CREATE POLICY "Users can read own enrollment submissions" 
ON public.enrollment_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can read all submissions using security definer function
CREATE POLICY "Admins can read all enrollment submissions" 
ON public.enrollment_submissions 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Users can create their own submissions with proper validation
CREATE POLICY "Secure enrollment submission creation" 
ON public.enrollment_submissions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  AND course_id IS NOT NULL
  AND form_data IS NOT NULL
  AND jsonb_typeof(form_data) = 'object'
);

-- Users can update their own submissions (for payment screenshots, etc.)
CREATE POLICY "Users can update own enrollment submissions" 
ON public.enrollment_submissions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all enrollment submissions
CREATE POLICY "Admins can manage all enrollment submissions" 
ON public.enrollment_submissions 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');