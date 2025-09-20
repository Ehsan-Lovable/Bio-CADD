-- Add explicit restrictive policy to prevent any anonymous access to batch_participants
-- This will block any access attempts by users who are not authenticated

-- First, create a restrictive policy to block anonymous access
CREATE POLICY "Block anonymous access to batch participants"
ON public.batch_participants
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add a comment to document this security enhancement
COMMENT ON POLICY "Block anonymous access to batch participants" ON public.batch_participants 
IS 'Explicitly blocks all access to batch participants for anonymous users to prevent any potential data exposure';