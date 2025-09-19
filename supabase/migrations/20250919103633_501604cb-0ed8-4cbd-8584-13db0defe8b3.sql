-- CRITICAL SECURITY FIXES - Phase 1 (Final Corrected Version)
-- This migration addresses the most critical security vulnerabilities identified in the security review

-- 1. Fix batch_participants RLS policies - Prevent student PII theft
-- Drop existing potentially vulnerable policies
DROP POLICY IF EXISTS "Users can view their own participation" ON public.batch_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.batch_participants;

-- Create secure policies that properly validate user access
CREATE POLICY "Participants can view only their own records" 
ON public.batch_participants 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Participants can update only their own records" 
ON public.batch_participants 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix career_applications RLS policies - Secure job applicant data
-- Drop existing policies
DROP POLICY IF EXISTS "admin read career applications" ON public.career_applications;
DROP POLICY IF EXISTS "secure career application submission" ON public.career_applications;

-- Create admin-only read policy
CREATE POLICY "Admin only read career applications" 
ON public.career_applications 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Secure submission policy with enhanced validation
CREATE POLICY "Secure career application submission" 
ON public.career_applications 
FOR INSERT 
WITH CHECK (
  -- Basic validation
  name IS NOT NULL AND name <> '' AND
  email IS NOT NULL AND email <> '' AND
  position IS NOT NULL AND position <> '' AND
  -- Email format validation
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Length limits
  length(name) <= 100 AND
  length(email) <= 255 AND
  length(position) <= 100 AND
  -- Optional field validation
  CASE WHEN phone IS NOT NULL THEN length(phone) <= 20 ELSE true END AND
  CASE WHEN experience IS NOT NULL THEN length(experience) <= 5000 ELSE true END AND
  CASE WHEN cover_letter IS NOT NULL THEN length(cover_letter) <= 10000 ELSE true END
);

-- 3. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log - admin read only
CREATE POLICY "Admins can read audit log" 
ON public.audit_log 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Create policy for system to insert audit records
CREATE POLICY "System can insert audit records" 
ON public.audit_log 
FOR INSERT 
WITH CHECK (true);

-- 4. Create secure role update function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.secure_update_user_role(
  target_user_id UUID,
  new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  target_current_role TEXT;
BEGIN
  -- Get current user's role
  SELECT get_current_user_role() INTO current_user_role;
  
  -- Only admins can change roles
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can modify user roles';
  END IF;
  
  -- Prevent self-demotion of the last admin
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    -- Check if this is the last admin
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last administrator';
    END IF;
  END IF;
  
  -- Get target user's current role
  SELECT role INTO target_current_role FROM profiles WHERE id = target_user_id;
  
  -- Log the role change attempt
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    performed_by
  ) VALUES (
    target_user_id,
    'role_change',
    'profiles',
    target_user_id,
    jsonb_build_object('role', target_current_role),
    jsonb_build_object('role', new_role),
    auth.uid()
  );
  
  -- Update the role
  UPDATE profiles 
  SET role = new_role 
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- 5. Fix database function security - Set search_path on all functions
-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role::text, 'student'::text) 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Update validate_profile_update function
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  update_count INTEGER;
  current_user_role TEXT;
BEGIN
  -- Prevent bulk operations that could be used for data harvesting
  IF TG_OP = 'UPDATE' THEN
    -- Ensure only reasonable changes are made
    IF NEW.id != OLD.id THEN
      RAISE EXCEPTION 'Profile ID cannot be changed';
    END IF;
    
    -- Get current user role to check if they can modify roles
    SELECT get_current_user_role() INTO current_user_role;
    
    -- Prevent role escalation - only admins can change roles
    IF NEW.role != OLD.role AND current_user_role != 'admin' THEN
      RAISE EXCEPTION 'Only administrators can modify user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE(
  user_id UUID,
  activity_type TEXT,
  count BIGINT,
  time_window TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check for rapid role change attempts
  SELECT 
    al.performed_by as user_id,
    'rapid_role_changes' as activity_type,
    COUNT(*) as count,
    '1 hour' as time_window
  FROM audit_log al
  WHERE al.action = 'role_change'
    AND al.performed_at > NOW() - INTERVAL '1 hour'
  GROUP BY al.performed_by
  HAVING COUNT(*) > 3;
$$;