-- Comprehensive security fixes for the application

-- 1. Fix profiles table role escalation protection
-- Update the validate_profile_update function to prevent role changes by non-admins
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
DECLARE
  update_count INTEGER;
  current_user_role TEXT;
BEGIN
  -- Prevent bulk operations that could be used for data harvesting
  IF TG_OP = 'UPDATE' THEN
    -- Ensure only reasonable changes are made
    IF NEW.id != OLD.id THEN
      RAISE EXCEPTION 'Profile ID cannot be changed';
    END IF;
    
    -- Get current user role to check if they can modify roles
    SELECT get_current_user_role() INTO current_user_role;
    
    -- Prevent role escalation - only admins can change roles
    IF NEW.role != OLD.role AND current_user_role != 'admin' THEN
      RAISE EXCEPTION 'Only administrators can modify user roles';
    END IF;
    
    -- Check for suspicious activity (multiple rapid updates)
    SELECT COUNT(*) INTO update_count
    FROM public.profiles 
    WHERE id = NEW.id 
    AND updated_at > NOW() - INTERVAL '1 minute';
    
    IF update_count > 5 THEN
      RAISE EXCEPTION 'Too many profile updates in short time period';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger is attached (recreate to be sure)
DROP TRIGGER IF EXISTS validate_profile_changes ON public.profiles;
CREATE TRIGGER validate_profile_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- 2. Fix lessons and resources gating - enforce real enrollment-based access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "read lessons" ON public.lessons;
DROP POLICY IF EXISTS "read resources" ON public.resources;

-- Create secure lesson access policy
CREATE POLICY "secure_lesson_access" 
ON public.lessons 
FOR SELECT 
TO authenticated
USING (
  -- Admins can read all lessons
  (get_current_user_role() = 'admin'::text) OR
  -- Users can read lessons if enrolled in the course
  (EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid() 
    AND e.course_id = lessons.course_id 
    AND e.status = 'active'
  )) OR
  -- Public can read preview lessons of published courses
  (is_preview = true AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = lessons.course_id 
    AND c.status = 'published'::course_status
  ))
);

-- Create secure resource access policy
CREATE POLICY "secure_resource_access" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (
  -- Admins can read all resources
  (get_current_user_role() = 'admin'::text) OR
  -- Users can read resources if enrolled in the course
  (EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid() 
    AND e.course_id = resources.course_id 
    AND e.status = 'active'
  ))
);

-- Allow unauthenticated users to read preview lessons of published courses
CREATE POLICY "public_preview_lessons" 
ON public.lessons 
FOR SELECT 
TO anon
USING (
  is_preview = true AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = lessons.course_id 
    AND c.status = 'published'::course_status
  )
);

-- 3. Attach missing rate-limiting triggers
-- Contact messages rate limiting trigger
DROP TRIGGER IF EXISTS contact_message_rate_limit ON public.contact_messages;
CREATE TRIGGER contact_message_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contact_message_rate_limit();

-- Career applications rate limiting trigger
DROP TRIGGER IF EXISTS career_application_rate_limit ON public.career_applications;
CREATE TRIGGER career_application_rate_limit
  BEFORE INSERT ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_career_application_rate_limit();

-- 4. Add missing updated_at triggers for data consistency
-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Courses updated_at trigger
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Portfolio projects updated_at trigger
DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Fix function search_path settings for security
-- Update certificate functions to include search_path
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_verification_hash(cert_id uuid, user_id uuid, course_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ENCODE(DIGEST(cert_id::TEXT || user_id::TEXT || course_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT, 'sha256'), 'hex');
END;
$$;