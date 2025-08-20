-- Fix security vulnerability: Restrict profile access to protect personal information
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "read profiles" ON public.profiles;

-- Create more secure policies
-- Allow users to read only their own profile
CREATE POLICY "users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow admins to read all profiles (needed for admin functionality)
CREATE POLICY "admins can read all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'::user_role
  )
);

-- Keep the existing update policy as it's already secure
-- CREATE POLICY "update own profile" already exists and is secure