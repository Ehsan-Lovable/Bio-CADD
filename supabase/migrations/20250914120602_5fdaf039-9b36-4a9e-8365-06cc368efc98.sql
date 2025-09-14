-- COMPREHENSIVE FIX: Clean up ALL foreign keys and recreate them properly
-- This will solve the loop issue by ensuring exactly one relationship per table pair

-- 1. First, drop ALL possible foreign key constraints on certificates
DROP INDEX IF EXISTS certificates_user_id_idx;
DROP INDEX IF EXISTS certificates_course_id_idx; 
DROP INDEX IF EXISTS certificates_batch_id_idx;

ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_user_id_fkey;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_course_id_fkey;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_batch_id_fkey;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS fk_certificates_user_id;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS fk_certificates_course_id;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS fk_certificates_batch_id;

-- 2. Now add exactly ONE foreign key constraint for each relationship
-- certificates -> profiles (user_id)
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- certificates -> courses (course_id)  
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES public.courses(id) 
ON DELETE SET NULL;

-- certificates -> course_batches (batch_id)
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_batch_id_fkey 
FOREIGN KEY (batch_id) REFERENCES public.course_batches(id) 
ON DELETE SET NULL;

-- 3. Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_course_id_idx ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS certificates_batch_id_idx ON public.certificates(batch_id);