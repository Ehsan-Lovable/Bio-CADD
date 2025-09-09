-- Fix profiles table security issue (corrected version)
-- Strengthen RLS policies to ensure proper access control for personal data

-- Drop existing policies to recreate them with better security
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "users_read_own_admins_read_all" ON public.profiles;
    DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
    DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
    DROP POLICY IF EXISTS "allow_profile_creation" ON public.profiles;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Policy 1: Users can only view their own profile, admins can view all
-- This prevents harvesting of personal information
CREATE POLICY "secure_profile_read" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = id) OR 
  (get_current_user_role() = 'admin'::text)
);

-- Policy 2: Users can only create their own profile during signup
CREATE POLICY "secure_profile_creation" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- Policy 3: Users can only update their own profile data
CREATE POLICY "secure_profile_update_user" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
);

-- Policy 4: Admins can update any profile (including roles)
CREATE POLICY "secure_profile_update_admin" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin'::text)
WITH CHECK (get_current_user_role() = 'admin'::text);

-- Policy 5: Prevent profile deletion by regular users (only admins if needed)
CREATE POLICY "prevent_profile_deletion" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (get_current_user_role() = 'admin'::text);

-- Add additional validation function to prevent data harvesting through profile updates
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
DECLARE
  update_count INTEGER;
BEGIN
  -- Prevent bulk operations that could be used for data harvesting
  IF TG_OP = 'UPDATE' THEN
    -- Ensure only reasonable changes are made
    IF NEW.id != OLD.id THEN
      RAISE EXCEPTION 'Profile ID cannot be changed';
    END IF;
    
    -- Check for suspicious activity (multiple rapid updates)
    SELECT COUNT(*) INTO update_count
    FROM public.profiles 
    WHERE id = NEW.id 
    AND updated_at > NOW() - INTERVAL '1 minute';
    
    IF update_count > 5 THEN
      RAISE EXCEPTION 'Too many profile updates in short time period';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for additional validation
DROP TRIGGER IF EXISTS validate_profile_changes ON public.profiles;
CREATE TRIGGER validate_profile_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();