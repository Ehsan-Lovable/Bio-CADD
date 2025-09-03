-- Check if the documents storage bucket exists
-- Run this to verify the bucket status

-- Check if documents bucket exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') 
    THEN '✅ Documents bucket EXISTS' 
    ELSE '❌ Documents bucket NOT FOUND' 
  END as bucket_status;

-- Show all storage buckets
SELECT 
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- Check storage policies for documents bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%documents%'
ORDER BY policyname;
