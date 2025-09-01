-- Fix infinite recursion in profiles RLS policies

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "users_read_own_admins_read_all" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "users_read_own_admins_read_all" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

-- Ensure update policy works correctly
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure insert policy works correctly
DROP POLICY IF EXISTS "allow_profile_creation" ON public.profiles;
CREATE POLICY "allow_profile_creation" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Check for any functions that need search_path fixes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;