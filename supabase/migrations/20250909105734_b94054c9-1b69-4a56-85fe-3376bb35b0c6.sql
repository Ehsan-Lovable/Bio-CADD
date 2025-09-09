-- Fix career_applications security issue
-- Remove the overly permissive INSERT policy
DROP POLICY IF EXISTS "anyone can submit career application" ON public.career_applications;

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
  length(phone) <= 20 AND
  length(experience) <= 5000 AND
  length(cover_letter) <= 10000
);

-- Ensure only admins can view applications (policy already exists but let's be explicit)
DROP POLICY IF EXISTS "admin read career applications" ON public.career_applications;

CREATE POLICY "admin read career applications" 
ON public.career_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

-- Add policy to prevent any updates/deletes except by admins
CREATE POLICY "admin manage career applications" 
ON public.career_applications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
) 
WITH CHECK (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS career_application_rate_limit ON public.career_applications;
CREATE TRIGGER career_application_rate_limit
  BEFORE INSERT ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_career_application_rate_limit();