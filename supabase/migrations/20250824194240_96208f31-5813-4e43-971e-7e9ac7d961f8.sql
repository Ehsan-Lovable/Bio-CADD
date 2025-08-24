-- Fix infinite recursion in profiles RLS policies using security definer function
-- First drop the problematic policy
DROP POLICY IF EXISTS "read profiles policy" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create proper RLS policies using the security definer function
CREATE POLICY "users can read own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "admins can read all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');