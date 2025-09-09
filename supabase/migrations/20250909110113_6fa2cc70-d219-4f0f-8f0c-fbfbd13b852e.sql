-- Fix contact_messages security issue
-- Remove the overly permissive INSERT policy and add proper validation
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "anyone can submit contact message" ON public.contact_messages;
    DROP POLICY IF EXISTS "admin read contact messages" ON public.contact_messages;
    DROP POLICY IF EXISTS "secure contact message submission" ON public.contact_messages;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Create a more secure INSERT policy with proper validation
CREATE POLICY "secure contact message submission" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are present
  name IS NOT NULL AND 
  name != '' AND
  email IS NOT NULL AND 
  email != '' AND
  message IS NOT NULL AND 
  message != '' AND
  -- Validate email format (basic validation)
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Ensure reasonable length limits to prevent abuse
  length(name) <= 100 AND
  length(email) <= 255 AND
  length(message) <= 5000 AND
  CASE WHEN subject IS NOT NULL THEN length(subject) <= 200 ELSE true END
);

-- Ensure only admins can view contact messages
CREATE POLICY "admin read contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

-- Create a function to help with rate limiting for contact messages
CREATE OR REPLACE FUNCTION public.check_contact_message_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent more than 5 messages from the same email in 1 hour
  IF (
    SELECT COUNT(*) 
    FROM public.contact_messages 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending another message.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS contact_message_rate_limit ON public.contact_messages;
CREATE TRIGGER contact_message_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contact_message_rate_limit();