-- Fix career_applications security issue - corrected version
-- First check and drop existing policies properly
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "secure career application submission" ON public.career_applications;
    DROP POLICY IF EXISTS "anyone can submit career application" ON public.career_applications;
    DROP POLICY IF EXISTS "admin read career applications" ON public.career_applications;
    DROP POLICY IF EXISTS "admin manage career applications" ON public.career_applications;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Create a more secure INSERT policy with proper validation
CREATE POLICY "secure career application submission" 
ON public.career_applications 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are present
  name IS NOT NULL AND 
  name != '' AND
  email IS NOT NULL AND 
  email != '' AND
  position IS NOT NULL AND 
  position != '' AND
  -- Validate email format (basic validation)
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Ensure reasonable length limits to prevent abuse
  length(name) <= 100 AND
  length(email) <= 255 AND
  length(position) <= 100 AND
  CASE WHEN phone IS NOT NULL THEN length(phone) <= 20 ELSE true END AND
  CASE WHEN experience IS NOT NULL THEN length(experience) <= 5000 ELSE true END AND
  CASE WHEN cover_letter IS NOT NULL THEN length(cover_letter) <= 10000 ELSE true END
);

-- Ensure only admins can view applications
CREATE POLICY "admin read career applications" 
ON public.career_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

-- Create a function to help with rate limiting (basic protection)
CREATE OR REPLACE FUNCTION public.check_career_application_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent more than 3 applications from the same email in 24 hours
  IF (
    SELECT COUNT(*) 
    FROM public.career_applications 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait 24 hours before submitting another application.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS career_application_rate_limit ON public.career_applications;
CREATE TRIGGER career_application_rate_limit
  BEFORE INSERT ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_career_application_rate_limit();