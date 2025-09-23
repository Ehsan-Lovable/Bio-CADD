-- Remove the recursive policy that causes infinite recursion
DROP POLICY IF EXISTS "prevent_profile_deletion" ON public.profiles;

-- Note: User deletion will be handled at the application level through the delete-user edge function
-- This eliminates the circular dependency where a profiles policy tries to query the profiles table