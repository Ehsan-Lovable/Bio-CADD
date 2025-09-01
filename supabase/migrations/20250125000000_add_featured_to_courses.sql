-- Add featured column to courses table
ALTER TABLE courses ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- Create index for featured courses for better performance
CREATE INDEX idx_courses_featured ON courses(featured) WHERE featured = TRUE;
