-- Add admin update policy for profiles table
CREATE POLICY "admin_update_all_profiles" ON public.profiles
FOR UPDATE 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');