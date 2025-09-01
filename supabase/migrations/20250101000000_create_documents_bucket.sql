-- Create documents storage bucket and comprehensive policies
-- This migration ensures the documents bucket exists with proper permissions

-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'documents', 
  'documents', 
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/bmp',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/bmp',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

-- Clean up any existing conflicting policies
DO $$ 
BEGIN
  -- Drop all existing policies for documents bucket to avoid conflicts
  DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admin can view all documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload enrollment documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their enrollment documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload to documents bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create comprehensive storage policies for documents bucket

-- Policy 1: Users can upload files to their own user folder
CREATE POLICY "documents_users_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view their own files
CREATE POLICY "documents_users_select" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Admins can view ALL documents (critical for admin panel)
CREATE POLICY "documents_admin_select_all" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  )
);

-- Policy 4: Users can update their own files
CREATE POLICY "documents_users_update" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Users can delete their own files
CREATE POLICY "documents_users_delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also ensure enrollment_submissions table has proper policies
DROP POLICY IF EXISTS "Users can create their own submissions" ON enrollment_submissions;
DROP POLICY IF EXISTS "Users can read their own submissions" ON enrollment_submissions;
DROP POLICY IF EXISTS "Admin can manage all submissions" ON enrollment_submissions;

CREATE POLICY "enrollment_submissions_users_insert" 
ON enrollment_submissions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

CREATE POLICY "enrollment_submissions_users_select" 
ON enrollment_submissions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

CREATE POLICY "enrollment_submissions_admin_all" 
ON enrollment_submissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
  )
);

-- Verify the setup
SELECT 
  'Setup completed successfully' as status,
  b.name as bucket_name,
  b.public as is_public,
  b.file_size_limit,
  array_length(b.allowed_mime_types, 1) as mime_types_count
FROM storage.buckets b 
WHERE b.id = 'documents';
