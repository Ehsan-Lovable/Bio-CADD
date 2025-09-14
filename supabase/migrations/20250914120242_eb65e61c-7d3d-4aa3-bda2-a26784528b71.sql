-- Add missing foreign key relationship between certificates and profiles
-- The certificates table has user_id that should reference profiles.id

ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;