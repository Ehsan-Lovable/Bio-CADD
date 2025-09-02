-- Database Verification Script
-- Run this to check if your database is consistent with frontend changes

-- Check current country options in database
SELECT field_name, field_label, field_options, is_required 
FROM public.enrollment_form_fields 
WHERE field_name = 'country' 
LIMIT 5;

-- Check state and city field configuration
SELECT field_name, field_label, is_required 
FROM public.enrollment_form_fields 
WHERE field_name IN ('state', 'city') 
ORDER BY field_order;

-- Check academic status options
SELECT field_name, field_options 
FROM public.enrollment_form_fields 
WHERE field_name = 'academic_status' 
LIMIT 3;

-- Check experience options  
SELECT field_name, field_options 
FROM public.enrollment_form_fields 
WHERE field_name = 'experience' 
LIMIT 3;

-- Check payment method options
SELECT field_name, field_options 
FROM public.enrollment_form_fields 
WHERE field_name = 'payment_method' 
LIMIT 3;

-- Count total countries available
SELECT 
  field_name,
  jsonb_array_length(field_options) as total_countries
FROM public.enrollment_form_fields 
WHERE field_name = 'country' 
LIMIT 5;

-- Expected results after migration:
-- country: should have 71 options (70 countries + "Other")
-- state: field_label = 'Current State', is_required = true
-- city: field_label = 'Current City', is_required = true  
-- academic_status: should have 8 options
-- experience: should have 4 options
-- payment_method: should have 3 options
