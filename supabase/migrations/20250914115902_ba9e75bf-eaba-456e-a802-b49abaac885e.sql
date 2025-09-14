-- Check if foreign key exists and create proper relationships for certificates table
-- First drop the constraint if it exists to avoid conflicts
ALTER TABLE public.certificates 
DROP CONSTRAINT IF EXISTS fk_certificates_course_id;

-- Add foreign key constraint between certificates and courses
ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Also add foreign key for batch_id to course_batches if it doesn't exist
ALTER TABLE public.certificates 
DROP CONSTRAINT IF EXISTS fk_certificates_batch_id;

ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_batch_id 
FOREIGN KEY (batch_id) REFERENCES public.course_batches(id) 
ON DELETE CASCADE ON UPDATE CASCADE;