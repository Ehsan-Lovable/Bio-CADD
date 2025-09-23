-- Add explicit policy to block anonymous access to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'block_anonymous_profile_access'
  ) THEN
    EXECUTE 'CREATE POLICY "block_anonymous_profile_access" ON public.profiles FOR ALL TO anon USING (false) WITH CHECK (false)';
  END IF;
END $$;

-- Ensure the existing profile read policy is secure and doesn't use recursive queries
-- Replace the existing policy with a more secure version that avoids infinite recursion
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;
CREATE POLICY "secure_profile_read" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can only read their own profile OR current user has admin role
  (auth.uid() = id) OR 
  (get_current_user_role() = 'admin')
);

-- Add stronger validation to profile updates
DROP POLICY IF EXISTS "secure_profile_update_user" ON public.profiles;
CREATE POLICY "secure_profile_update_user" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL AND role = OLD.role);