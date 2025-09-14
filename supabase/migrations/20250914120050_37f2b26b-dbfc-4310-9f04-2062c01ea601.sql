-- Fix the duplicate foreign key relationship issue
-- Check all foreign key constraints on certificates table
SELECT 
  tc.constraint_name,
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'certificates';

-- Drop all existing foreign key constraints on certificates to clean up
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS fk_certificates_course_id;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS fk_certificates_batch_id;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_course_id_fkey;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_batch_id_fkey;

-- Re-add clean foreign key constraints
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES public.courses(id) 
ON DELETE SET NULL;

ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_batch_id_fkey 
FOREIGN KEY (batch_id) REFERENCES public.course_batches(id) 
ON DELETE SET NULL;