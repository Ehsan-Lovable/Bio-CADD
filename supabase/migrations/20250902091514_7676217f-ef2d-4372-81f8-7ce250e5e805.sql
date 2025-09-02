-- Add upcoming column to courses table for marking courses as upcoming
ALTER TABLE public.courses 
ADD COLUMN upcoming boolean DEFAULT false;