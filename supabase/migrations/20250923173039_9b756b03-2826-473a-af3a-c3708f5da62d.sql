-- Add missing updated_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Update existing records to have the updated_at timestamp
UPDATE public.profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL;