-- Add SVG support to all storage buckets
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
WHERE id IN ('course-posters', 'avatars', 'portfolio-images', 'portfolio-files', 'documents');