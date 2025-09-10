-- Add missing foreign key relationships (only ones that don't exist)
ALTER TABLE certificates 
ADD CONSTRAINT certificates_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

ALTER TABLE course_batches 
ADD CONSTRAINT course_batches_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;