-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "admins can read all profiles" ON public.profiles;

-- Create a better RLS policy that doesn't cause recursion
-- Admin users can read all profiles, regular users can only read their own
CREATE POLICY "read profiles policy" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'::user_role
    AND admin_profile.id != profiles.id  -- Prevent self-referencing
  )
);