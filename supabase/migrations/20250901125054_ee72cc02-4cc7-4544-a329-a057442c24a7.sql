-- Create table for form field configurations
CREATE TABLE public.enrollment_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'tel', 'select', 'textarea', 'file')),
  field_label TEXT NOT NULL,
  field_options JSONB DEFAULT '[]'::jsonb, -- For select fields
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for enrollment submissions
CREATE TABLE public.enrollment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id) -- One submission per user per course
);

-- Enable Row Level Security
ALTER TABLE public.enrollment_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrollment_form_fields
CREATE POLICY "Admin can manage form fields" 
ON public.enrollment_form_fields 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

CREATE POLICY "Anyone can read active form fields" 
ON public.enrollment_form_fields 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for enrollment_submissions
CREATE POLICY "Users can create their own submissions" 
ON public.enrollment_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own submissions" 
ON public.enrollment_submissions 
FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

CREATE POLICY "Admin can manage all submissions" 
ON public.enrollment_submissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

-- Create triggers for updated_at
CREATE TRIGGER update_enrollment_form_fields_updated_at
BEFORE UPDATE ON public.enrollment_form_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollment_submissions_updated_at
BEFORE UPDATE ON public.enrollment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default form fields for all existing courses
INSERT INTO public.enrollment_form_fields (course_id, field_name, field_type, field_label, is_required, field_order)
SELECT 
  c.id,
  field_name,
  field_type,
  field_label,
  is_required,
  field_order
FROM public.courses c
CROSS JOIN (VALUES
  ('full_name', 'text', 'Full Name', true, 1),
  ('email', 'email', 'Email', true, 2),
  ('discipline', 'text', 'Discipline', true, 3),
  ('university', 'text', 'University', true, 4),
  ('phone', 'tel', 'Phone', true, 5),
  ('messenger', 'text', 'Messenger/WhatsApp', true, 6),
  ('telegram', 'text', 'Telegram', false, 7),
  ('country', 'select', 'Country', true, 8),
  ('state', 'text', 'State', true, 9),
  ('city', 'text', 'City', true, 10),
  ('academic_status', 'select', 'Academic/Professional Status', true, 11),
  ('experience', 'select', 'Experience', true, 12),
  ('comments', 'textarea', 'Comments', false, 13),
  ('payment_method', 'select', 'Preferred Payment Method', true, 14),
  ('payment_screenshot', 'file', 'Payment Screenshot', true, 15)
) AS default_fields(field_name, field_type, field_label, is_required, field_order);

-- Update form fields with select options
UPDATE public.enrollment_form_fields 
SET field_options = '["Bangladesh", "India", "Pakistan", "Nepal", "Sri Lanka", "Other"]'::jsonb
WHERE field_name = 'country';

UPDATE public.enrollment_form_fields 
SET field_options = '["Student", "Professional", "Researcher", "Other"]'::jsonb
WHERE field_name = 'academic_status';

UPDATE public.enrollment_form_fields 
SET field_options = '["Beginner", "Intermediate", "Advanced"]'::jsonb
WHERE field_name = 'experience';

UPDATE public.enrollment_form_fields 
SET field_options = '["UPI", "PayPal", "Bkash", "Bank Transfer"]'::jsonb
WHERE field_name = 'payment_method';