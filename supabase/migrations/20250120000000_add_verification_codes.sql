-- Add verification code field to certificates table
ALTER TABLE public.certificates ADD COLUMN verification_code TEXT UNIQUE;

-- Create index for faster verification lookups
CREATE INDEX idx_certificates_verification_code ON public.certificates(verification_code);

-- Create function to generate course-specific verification codes
CREATE OR REPLACE FUNCTION public.generate_verification_code(course_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_code TEXT;
  random_code TEXT;
  verification_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Get course code from courses table
  SELECT slug INTO course_code
  FROM courses
  WHERE id = course_id;
  
  -- If no slug, use first 6 characters of title
  IF course_code IS NULL OR course_code = '' THEN
    SELECT UPPER(LEFT(REPLACE(title, ' ', ''), 6)) INTO course_code
    FROM courses
    WHERE id = course_id;
  END IF;
  
  -- Generate random 6-character code
  random_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
  
  -- Create verification code
  verification_code := 'BC-' || UPPER(course_code) || '-' || random_code;
  
  -- Check if code already exists
  SELECT EXISTS(SELECT 1 FROM certificates WHERE verification_code = verification_code) INTO code_exists;
  
  -- If exists, generate new one (max 5 attempts)
  WHILE code_exists LOOP
    random_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    verification_code := 'BC-' || UPPER(course_code) || '-' || random_code;
    SELECT EXISTS(SELECT 1 FROM certificates WHERE verification_code = verification_code) INTO code_exists;
  END LOOP;
  
  RETURN verification_code;
END;
$$;

-- Update the auto_generate_certificate function to use verification codes
CREATE OR REPLACE FUNCTION public.auto_generate_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_progress_percentage NUMERIC;
  total_lessons INTEGER;
  completed_lessons INTEGER;
  cert_number TEXT;
  verification_code TEXT;
  verification_hash TEXT;
  qr_data TEXT;
  cert_id UUID;
BEGIN
  -- Only proceed if lesson was just marked as completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Calculate course completion percentage
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE completed = true) as completed
    INTO total_lessons, completed_lessons
    FROM lesson_progress
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
    
    course_progress_percentage := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
    
    -- Only issue certificate if 100% completion
    IF course_progress_percentage >= 100 THEN
      -- Check if certificate already exists
      IF NOT EXISTS (
        SELECT 1 FROM certificates 
        WHERE user_id = NEW.user_id 
        AND course_id = NEW.course_id 
        AND status = 'active'
      ) THEN
        -- Generate certificate data
        cert_id := gen_random_uuid();
        cert_number := generate_certificate_number();
        verification_code := generate_verification_code(NEW.course_id);
        verification_hash := generate_verification_hash(cert_id, NEW.user_id, NEW.course_id);
        
        -- Generate QR code data (URL to verification page)
        qr_data := '/verify?code=' || verification_code;
        
        -- Insert certificate record
        INSERT INTO certificates (
          id,
          user_id,
          course_id,
          certificate_number,
          verification_code,
          verification_hash,
          qr_code_data,
          completed_at,
          metadata
        ) VALUES (
          cert_id,
          NEW.user_id,
          NEW.course_id,
          cert_number,
          verification_code,
          verification_hash,
          qr_data,
          NOW(),
          jsonb_build_object(
            'completion_percentage', course_progress_percentage,
            'total_lessons', total_lessons,
            'completed_lessons', completed_lessons,
            'auto_generated', true
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the issue_certificate_for_batch function to use verification codes
CREATE OR REPLACE FUNCTION public.issue_certificate_for_batch(
  p_user_id UUID,
  p_batch_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_id UUID;
  cert_id UUID;
  cert_number TEXT;
  verification_code TEXT;
  verification_hash TEXT;
  qr_data TEXT;
BEGIN
  -- Get course_id from batch
  SELECT course_id INTO course_id
  FROM course_batches
  WHERE id = p_batch_id;
  
  IF course_id IS NULL THEN
    RAISE EXCEPTION 'Course not found for batch %', p_batch_id;
  END IF;
  
  -- Check if certificate already exists
  IF EXISTS (
    SELECT 1 FROM certificates 
    WHERE user_id = p_user_id 
    AND batch_id = p_batch_id 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Certificate already exists for this user and batch';
  END IF;
  
  -- Generate certificate data
  cert_id := gen_random_uuid();
  cert_number := generate_certificate_number();
  verification_code := generate_verification_code(course_id);
  verification_hash := generate_verification_hash(cert_id, p_user_id, p_batch_id);
  
  -- Generate QR code data (URL to verification page)
  qr_data := '/verify?code=' || verification_code;
  
  -- Insert certificate
  INSERT INTO certificates (
    id,
    user_id,
    batch_id,
    certificate_number,
    verification_code,
    verification_hash,
    qr_code_data,
    issued_by,
    metadata
  ) VALUES (
    cert_id,
    p_user_id,
    p_batch_id,
    cert_number,
    verification_code,
    verification_hash,
    qr_data,
    auth.uid(),
    jsonb_build_object(
      'batch_issued', true,
      'issued_by_admin', true
    )
  );
  
  RETURN cert_id;
END;
$$;

-- Update RLS policies to allow public verification
CREATE POLICY "Public can verify certificates" 
ON public.certificates 
FOR SELECT 
USING (verification_code IS NOT NULL AND status = 'active');

-- Update certificate_verifications table to track verification codes
ALTER TABLE public.certificate_verifications 
ADD COLUMN verification_code TEXT;

-- Create index for verification code lookups
CREATE INDEX idx_certificate_verifications_code ON public.certificate_verifications(verification_code);

