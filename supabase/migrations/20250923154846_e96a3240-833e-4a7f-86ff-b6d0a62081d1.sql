-- Fix RLS policies without OLD reference issues
-- Remove existing problematic policies
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;
DROP POLICY IF EXISTS "secure_profile_update_user" ON public.profiles;

-- Create secure profile read policy (no recursion)
CREATE POLICY "secure_profile_read_final" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can only read their own profile
  auth.uid() = id
);

-- Create separate admin read policy  
CREATE POLICY "admin_read_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Direct role check for current user to allow admin access
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'::user_role
    LIMIT 1
  )
);

-- Create secure profile update policy
CREATE POLICY "secure_profile_update_final" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add explicit anonymous blocking (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'block_anonymous_access'
  ) THEN
    EXECUTE 'CREATE POLICY "block_anonymous_access" ON public.profiles FOR ALL TO anon USING (false)';
  END IF;
END $$;