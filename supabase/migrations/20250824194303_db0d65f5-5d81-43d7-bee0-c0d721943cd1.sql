-- Check and fix existing policies
-- Drop all existing policies for profiles table
DROP POLICY IF EXISTS "users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create proper RLS policies using the security definer function
CREATE POLICY "read own profile or admin reads all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);