-- Migration to update enrollment form fields with comprehensive country list and mandatory state/city
-- This ensures database consistency with the updated frontend form

-- Update field labels for state and city to be more descriptive
UPDATE public.enrollment_form_fields 
SET field_label = 'Current State'
WHERE field_name = 'state';

UPDATE public.enrollment_form_fields 
SET field_label = 'Current City'
WHERE field_name = 'city';

-- Make state and city fields required (they were optional in original migration)
UPDATE public.enrollment_form_fields 
SET is_required = true
WHERE field_name IN ('state', 'city');

-- Update country field with comprehensive list of 70+ countries
UPDATE public.enrollment_form_fields 
SET field_options = '[
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
  "Cambodia", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Czech Republic",
  "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait",
  "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Nepal",
  "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore",
  "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Venezuela", "Vietnam", "Yemen", "Other"
]'::jsonb
WHERE field_name = 'country';

-- Update academic status options to match frontend
UPDATE public.enrollment_form_fields 
SET field_options = '[
  "Undergraduate Student", 
  "Graduate Student", 
  "PhD Student", 
  "Postdoc", 
  "Faculty/Professor", 
  "Industry Professional", 
  "Research Scientist", 
  "Other"
]'::jsonb
WHERE field_name = 'academic_status';

-- Update experience options to match frontend
UPDATE public.enrollment_form_fields 
SET field_options = '[
  "Beginner (0-1 years)", 
  "Intermediate (1-3 years)", 
  "Advanced (3-5 years)", 
  "Expert (5+ years)"
]'::jsonb
WHERE field_name = 'experience';

-- Update payment method options to match frontend
UPDATE public.enrollment_form_fields 
SET field_options = '["UPI", "PayPal", "Bkash"]'::jsonb
WHERE field_name = 'payment_method';

-- Fix messenger field name consistency (was 'messenger' in DB, should be 'messenger_whatsapp')
UPDATE public.enrollment_form_fields 
SET field_name = 'messenger_whatsapp',
    field_label = 'Messenger/WhatsApp'
WHERE field_name = 'messenger';

-- Insert any missing default fields for existing courses that might not have complete field sets
-- This handles cases where courses were created before all fields were defined

INSERT INTO public.enrollment_form_fields (course_id, field_name, field_type, field_label, is_required, field_order, field_options)
SELECT DISTINCT 
  c.id as course_id,
  missing_field.field_name,
  missing_field.field_type,
  missing_field.field_label,
  missing_field.is_required,
  missing_field.field_order,
  missing_field.field_options::jsonb
FROM public.courses c
CROSS JOIN (VALUES
  ('full_name', 'text', 'Full Name', true, 1, '[]'),
  ('email', 'email', 'Email', true, 2, '[]'),
  ('discipline', 'text', 'Discipline', true, 3, '[]'),
  ('university', 'text', 'University', true, 4, '[]'),
  ('phone', 'tel', 'Phone', true, 5, '[]'),
  ('messenger_whatsapp', 'text', 'Messenger/WhatsApp', true, 6, '[]'),
  ('telegram', 'text', 'Telegram', false, 7, '[]'),
  ('country', 'select', 'Country', true, 8, '["Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Syria", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Other"]'),
  ('state', 'text', 'Current State', true, 9, '[]'),
  ('city', 'text', 'Current City', true, 10, '[]'),
  ('academic_status', 'select', 'Academic/Professional Status', true, 11, '["Undergraduate Student", "Graduate Student", "PhD Student", "Postdoc", "Faculty/Professor", "Industry Professional", "Research Scientist", "Other"]'),
  ('experience', 'select', 'Experience', true, 12, '["Beginner (0-1 years)", "Intermediate (1-3 years)", "Advanced (3-5 years)", "Expert (5+ years)"]'),
  ('comments', 'textarea', 'Comments', false, 13, '[]'),
  ('payment_method', 'select', 'Preferred Payment Method', true, 14, '["UPI", "PayPal", "Bkash"]'),
  ('payment_screenshot', 'file', 'Payment Screenshot', true, 15, '[]')
) AS missing_field(field_name, field_type, field_label, is_required, field_order, field_options)
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.enrollment_form_fields eff 
  WHERE eff.course_id = c.id 
  AND eff.field_name = missing_field.field_name
);

-- Update the updated_at timestamp for all modified records
UPDATE public.enrollment_form_fields 
SET updated_at = now() 
WHERE field_name IN ('country', 'state', 'city', 'academic_status', 'experience', 'payment_method', 'messenger_whatsapp');

-- Add comments to document the changes
COMMENT ON TABLE public.enrollment_form_fields IS 'Form field configurations for course enrollment. Updated with comprehensive country list and mandatory location fields.';
COMMENT ON COLUMN public.enrollment_form_fields.field_options IS 'JSONB array of options for select fields. Contains 70+ countries for country field.';
