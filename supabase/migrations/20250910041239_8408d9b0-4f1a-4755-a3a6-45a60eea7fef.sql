-- Add proper foreign key relationships for certificates table
ALTER TABLE certificates 
ADD CONSTRAINT certificates_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

ALTER TABLE certificates 
ADD CONSTRAINT certificates_batch_id_fkey 
FOREIGN KEY (batch_id) REFERENCES course_batches(id) ON DELETE SET NULL;

-- Add foreign key for course_batches
ALTER TABLE course_batches 
ADD CONSTRAINT course_batches_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;