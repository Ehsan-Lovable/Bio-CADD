-- Strengthen profiles table RLS policies to prevent any potential data leakage
-- Add explicit policy to block anonymous access
CREATE POLICY "block_anonymous_profile_access" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Add policy to ensure only authenticated users can read profiles with proper restrictions  
DROP POLICY IF EXISTS "secure_profile_read" ON public.profiles;
CREATE POLICY "secure_profile_read" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can only read their own profile OR admins can read all profiles
  (auth.uid() = id) OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'::user_role
    )
  )
);

-- Ensure that profile updates are properly restricted
DROP POLICY IF EXISTS "secure_profile_update_user" ON public.profiles;
CREATE POLICY "secure_profile_update_user" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Add audit logging trigger for profile access (optional security monitoring)
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive profile data access for security monitoring
  IF TG_OP = 'SELECT' AND NEW.role = 'admin' THEN
    INSERT INTO public.audit_log (
      action,
      table_name,
      record_id,
      performed_by,
      new_values
    ) VALUES (
      'admin_profile_access',
      'profiles',
      NEW.id,
      auth.uid(),
      jsonb_build_object('accessed_user', NEW.id, 'accessor_role', 'admin')
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;