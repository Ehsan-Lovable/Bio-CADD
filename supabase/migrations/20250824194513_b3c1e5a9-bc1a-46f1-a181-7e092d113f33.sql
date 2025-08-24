-- Clean up all profiles policies and fix the infinite recursion
DROP POLICY IF EXISTS "read own profile or admin reads all" ON public.profiles;
DROP POLICY IF EXISTS "read profiles policy" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

-- Create the final correct policy
CREATE POLICY "users_read_own_admins_read_all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);