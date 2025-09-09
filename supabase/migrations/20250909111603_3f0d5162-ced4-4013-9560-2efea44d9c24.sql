-- Fix contact_messages security to prevent any unauthorized access
-- This ensures customer contact information cannot be stolen

-- First, let's make sure we have the most restrictive policies possible

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "admin read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "secure contact message submission" ON public.contact_messages;

-- Policy 1: Only authenticated admins can read contact messages
-- This prevents any unauthorized access to customer contact information
CREATE POLICY "admin_only_read_contact_messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated  -- Only authenticated users, not anonymous
USING (
  -- Only users with admin role can read
  (get_current_user_role() = 'admin'::text)
);

-- Policy 2: Allow secure contact message submission (both authenticated and anonymous users)
-- This allows the contact form to work for website visitors
CREATE POLICY "allow_contact_form_submission" 
ON public.contact_messages 
FOR INSERT 
TO public  -- Allow both authenticated and anonymous users to submit
WITH CHECK (
  -- Comprehensive validation to prevent malicious submissions
  (name IS NOT NULL) AND 
  (name <> ''::text) AND 
  (email IS NOT NULL) AND 
  (email <> ''::text) AND 
  (message IS NOT NULL) AND 
  (message <> ''::text) AND 
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) AND 
  (length(name) <= 100) AND 
  (length(email) <= 255) AND 
  (length(message) <= 5000) AND
  CASE
    WHEN (subject IS NOT NULL) THEN (length(subject) <= 200)
    ELSE true
  END
);

-- Policy 3: Prevent any UPDATE operations to maintain data integrity
-- Contact messages should not be modifiable once submitted
CREATE POLICY "prevent_contact_message_updates" 
ON public.contact_messages 
FOR UPDATE 
TO public
USING (false);  -- Deny all updates

-- Policy 4: Prevent any DELETE operations except by admins
-- Only admins should be able to delete contact messages
CREATE POLICY "admin_only_delete_contact_messages" 
ON public.contact_messages 
FOR DELETE 
TO authenticated
USING (
  (get_current_user_role() = 'admin'::text)
);

-- Add a comment to document the security design
COMMENT ON TABLE public.contact_messages IS 'Customer contact messages - RLS policies ensure only admins can read, preventing data theft';