-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  false, -- Private bucket for security
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

-- Create storage policies for the documents bucket

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can view all files
CREATE POLICY "Admins can view all files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Policy: Admins can delete files if needed
CREATE POLICY "Admins can delete files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);