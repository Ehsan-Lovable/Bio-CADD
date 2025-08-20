-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('course-posters', 'course-posters', true),
  ('avatars', 'avatars', true),
  ('documents', 'documents', false);

-- Create storage policies for course posters (public read, admin write)
CREATE POLICY "Anyone can view course posters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-posters');

CREATE POLICY "Admins can upload course posters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-posters' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update course posters" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-posters' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete course posters" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-posters' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create storage policies for avatars (public read, users can manage their own)
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for documents (private, users can manage their own)
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);