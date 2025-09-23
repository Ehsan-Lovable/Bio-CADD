-- Fix infinite recursion by dropping ALL existing profiles policies and creating clean ones
-- Drop all existing policies first
DROP POLICY IF EXISTS "secure_profile_read_final" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_update_final" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_creation" ON public.profiles;
DROP POLICY IF EXISTS "block_anonymous_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "block_anonymous_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles_v2" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_update_user" ON public.profiles;

-- Now create only the clean, non-recursive policies
-- Users can read their own profile ONLY
CREATE POLICY "users_read_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile ONLY
CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "users_create_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Block ALL anonymous access
CREATE POLICY "block_all_anonymous_access" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Note: Admin access to profiles is now handled at the application level
-- This eliminates all recursion issues