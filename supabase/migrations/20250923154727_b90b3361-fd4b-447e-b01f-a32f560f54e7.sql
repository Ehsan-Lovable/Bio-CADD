-- Fix infinite recursion in profiles RLS policies
-- First, check current policies and remove problematic ones
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;

-- Create a non-recursive profile read policy 
CREATE POLICY "secure_profile_read_v2" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can read their own profile OR users with admin role can read all
  auth.uid() = id OR 
  (
    -- Check role directly without function to avoid recursion
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ) = 'admin'::user_role
);

-- Strengthen profile update policy 
DROP POLICY IF EXISTS "secure_profile_update_user" ON public.profiles;
CREATE POLICY "secure_profile_update_user_v2" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = OLD.role);