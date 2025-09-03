-- Simple Storage Bucket Creation
-- This approach works with standard Supabase permissions

-- First, let's check if the bucket already exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') 
    THEN '✅ Documents bucket already EXISTS' 
    ELSE '❌ Documents bucket NOT FOUND - needs to be created via Dashboard' 
  END as bucket_status;

-- Show current storage buckets
SELECT 
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;
