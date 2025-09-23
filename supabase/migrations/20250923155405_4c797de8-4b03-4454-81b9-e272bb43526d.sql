-- Fix infinite recursion in profiles RLS policies
-- Remove ALL existing policies that cause recursion
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_update_admin" ON public.profiles; 
DROP POLICY IF EXISTS "admin_read_all_profiles_v2" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;

-- Keep only simple, non-recursive policies
-- Users can read their own profile only
CREATE POLICY "secure_profile_read_final" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile only  
CREATE POLICY "secure_profile_update_final" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "secure_profile_creation" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Block anonymous access completely
CREATE POLICY "block_anonymous_profile_access" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Admin deletion handled by existing policy using get_current_user_role()
-- (this function works because it's called from OTHER tables' policies, not profiles)