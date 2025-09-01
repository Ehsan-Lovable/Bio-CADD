-- Fix storage bucket policies for enrollment documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for enrollment documents
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload enrollment documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their enrollment documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admin can view all documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policy for users to upload their own documents
CREATE POLICY "Users can upload enrollment documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own documents
CREATE POLICY "Users can view their enrollment documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for admins to view all documents
CREATE POLICY "Admin can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Update enrollment_submissions RLS policy to be more explicit
DROP POLICY IF EXISTS "Users can create their own submissions" ON enrollment_submissions;

CREATE POLICY "Users can create their own submissions" 
ON enrollment_submissions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);