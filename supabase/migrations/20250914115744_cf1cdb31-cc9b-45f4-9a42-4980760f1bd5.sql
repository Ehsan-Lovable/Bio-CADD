-- Add missing foreign key relationship between certificates and courses
ALTER TABLE public.certificates 
ADD CONSTRAINT fk_certificates_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) 
ON DELETE SET NULL;