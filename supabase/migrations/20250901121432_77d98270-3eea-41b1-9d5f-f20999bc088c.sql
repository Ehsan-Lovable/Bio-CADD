-- Add featured column to courses table
ALTER TABLE public.courses ADD COLUMN featured boolean DEFAULT false;