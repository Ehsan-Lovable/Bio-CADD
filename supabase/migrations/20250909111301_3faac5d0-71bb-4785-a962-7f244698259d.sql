-- Add missing triggers for rate limiting and data consistency

-- 1. Contact messages rate limiting trigger (if not exists)
DO $$
BEGIN
  -- Check if trigger exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'contact_message_rate_limit' 
    AND event_object_table = 'contact_messages'
  ) THEN
    CREATE TRIGGER contact_message_rate_limit
      BEFORE INSERT ON public.contact_messages
      FOR EACH ROW
      EXECUTE FUNCTION public.check_contact_message_rate_limit();
  END IF;
END $$;

-- 2. Career applications rate limiting trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'career_application_rate_limit' 
    AND event_object_table = 'career_applications'
  ) THEN
    CREATE TRIGGER career_application_rate_limit
      BEFORE INSERT ON public.career_applications
      FOR EACH ROW
      EXECUTE FUNCTION public.check_career_application_rate_limit();
  END IF;
END $$;

-- 3. Profiles updated_at trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_profiles_updated_at' 
    AND event_object_table = 'profiles'
  ) THEN
    -- First add updated_at column if it doesn't exist
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4. Courses updated_at trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_courses_updated_at' 
    AND event_object_table = 'courses'
  ) THEN
    CREATE TRIGGER update_courses_updated_at
      BEFORE UPDATE ON public.courses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5. Portfolio projects updated_at trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_portfolio_projects_updated_at' 
    AND event_object_table = 'portfolio_projects'
  ) THEN
    CREATE TRIGGER update_portfolio_projects_updated_at
      BEFORE UPDATE ON public.portfolio_projects
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6. Certificate auto-generation trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'auto_generate_certificate_trigger' 
    AND event_object_table = 'lesson_progress'
  ) THEN
    CREATE TRIGGER auto_generate_certificate_trigger
      AFTER INSERT OR UPDATE ON public.lesson_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_generate_certificate();
  END IF;
END $$;

-- 7. User profile creation trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND trigger_schema = 'auth'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;