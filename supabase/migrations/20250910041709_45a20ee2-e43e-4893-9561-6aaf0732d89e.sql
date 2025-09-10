-- Fix the security issue with batch_participants table
-- Create a proper security definer function for role checking to avoid RLS recursion

-- First, update the existing function to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(role::text, 'student'::text) 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Drop existing policies for batch_participants to recreate them securely
DROP POLICY IF EXISTS "Admins can manage all participants" ON public.batch_participants;
DROP POLICY IF EXISTS "Users can update their own participation status" ON public.batch_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON public.batch_participants;

-- Create secure RLS policies for batch_participants
-- Policy 1: Users can only view their own participation records
CREATE POLICY "Users can view their own participation"
ON public.batch_participants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins can view all participation records
CREATE POLICY "Admins can view all participants"
ON public.batch_participants
FOR SELECT
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Policy 3: Users can update their own participation status (limited fields)
CREATE POLICY "Users can update their own participation"
ON public.batch_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can manage all participants
CREATE POLICY "Admins can manage all participants"
ON public.batch_participants
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Policy 5: Only admins can insert new participants
CREATE POLICY "Admins can insert participants"
ON public.batch_participants
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Ensure RLS is enabled
ALTER TABLE public.batch_participants ENABLE ROW LEVEL SECURITY;