-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  verification_hash TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  issued_by UUID,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,
  revoked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificate templates table
CREATE TABLE public.certificate_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificate verifications table (for tracking verification attempts)
CREATE TABLE public.certificate_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verifier_ip TEXT,
  verifier_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all certificates" 
ON public.certificates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

-- RLS Policies for certificate templates
CREATE POLICY "Admins can manage certificate templates" 
ON public.certificate_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

CREATE POLICY "Anyone can view active templates" 
ON public.certificate_templates 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for certificate verifications
CREATE POLICY "Anyone can create verification records" 
ON public.certificate_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all verification records" 
ON public.certificate_verifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
));

-- Create function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate verification hash
CREATE OR REPLACE FUNCTION public.generate_verification_hash(cert_id UUID, user_id UUID, course_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN ENCODE(DIGEST(cert_id::TEXT || user_id::TEXT || course_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate certificate on course completion
CREATE OR REPLACE FUNCTION public.auto_generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  course_progress_percentage NUMERIC;
  total_lessons INTEGER;
  completed_lessons INTEGER;
  cert_number TEXT;
  verification_hash TEXT;
BEGIN
  -- Only proceed if lesson was just marked as completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Calculate course completion percentage
    SELECT COUNT(*) INTO total_lessons
    FROM lessons WHERE course_id = NEW.course_id;
    
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress 
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id 
    AND completed = true;
    
    -- If all lessons are completed (100%), generate certificate
    IF total_lessons > 0 AND completed_lessons = total_lessons THEN
      -- Check if certificate already exists
      IF NOT EXISTS (
        SELECT 1 FROM certificates 
        WHERE user_id = NEW.user_id AND course_id = NEW.course_id
      ) THEN
        -- Generate certificate number and verification hash
        cert_number := generate_certificate_number();
        verification_hash := generate_verification_hash(gen_random_uuid(), NEW.user_id, NEW.course_id);
        
        -- Insert certificate record
        INSERT INTO certificates (
          user_id, 
          course_id, 
          certificate_number, 
          verification_hash, 
          completed_at,
          metadata
        ) VALUES (
          NEW.user_id, 
          NEW.course_id, 
          cert_number, 
          verification_hash, 
          NOW(),
          jsonb_build_object(
            'completion_percentage', 100,
            'total_lessons', total_lessons,
            'completed_lessons', completed_lessons
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto certificate generation
CREATE TRIGGER auto_generate_certificate_trigger
  AFTER UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_certificate();

-- Create trigger for updated_at
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default certificate template
INSERT INTO certificate_templates (name, description, template_data, is_default, is_active, created_by) 
VALUES (
  'Default Certificate Template',
  'Standard certificate template for course completion',
  jsonb_build_object(
    'title', 'Certificate of Completion',
    'subtitle', 'This is to certify that',
    'footer_text', 'has successfully completed the course',
    'signature_text', 'Authorized Signature',
    'colors', jsonb_build_object(
      'primary', '#1e40af',
      'secondary', '#f59e0b',
      'text', '#1f2937',
      'background', '#ffffff'
    ),
    'layout', jsonb_build_object(
      'orientation', 'landscape',
      'margins', jsonb_build_object('top', 50, 'right', 50, 'bottom', 50, 'left', 50)
    )
  ),
  true,
  true,
  NULL
);