-- Fix all database functions to have proper search_path
-- This addresses the Function Search Path Mutable security warning

-- Update all functions that don't have search_path set
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
$$;

CREATE OR REPLACE FUNCTION public.check_career_application_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent more than 3 applications from the same email in 24 hours
  IF (
    SELECT COUNT(*) 
    FROM public.career_applications 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait 24 hours before submitting another application.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_contact_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent more than 5 messages from the same email in 1 hour
  IF (
    SELECT COUNT(*) 
    FROM public.contact_messages 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending another message.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_verification_hash(cert_id uuid, user_id uuid, course_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ENCODE(DIGEST(cert_id::TEXT || user_id::TEXT || course_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_batch_certificate(p_batch_id uuid, p_user_id uuid, p_issued_by uuid DEFAULT NULL::uuid)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cert_id UUID;
  cert_number TEXT;
  verification_hash TEXT;
  qr_data TEXT;
BEGIN
  -- Check if certificate already exists
  IF EXISTS (
    SELECT 1 FROM certificates 
    WHERE batch_id = p_batch_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Certificate already issued for this participant';
  END IF;

  -- Generate certificate details
  cert_number := generate_certificate_number();
  cert_id := gen_random_uuid();
  verification_hash := generate_verification_hash(cert_id, p_user_id, p_batch_id);
  
  -- Generate QR code data (URL to verification page)
  qr_data := '/certificate-verify?number=' || cert_number || '&hash=' || verification_hash;

  -- Insert certificate
  INSERT INTO certificates (
    id,
    user_id,
    batch_id,
    certificate_number,
    verification_hash,
    qr_code_data,
    issued_by,
    metadata
  ) VALUES (
    cert_id,
    p_user_id,
    p_batch_id,
    cert_number,
    verification_hash,
    qr_data,
    COALESCE(p_issued_by, auth.uid()),
    jsonb_build_object(
      'batch_issued', true,
      'issued_at', NOW()
    )
  );

  -- Update participant certificate status
  UPDATE batch_participants 
  SET certificate_issued = TRUE 
  WHERE batch_id = p_batch_id AND user_id = p_user_id;

  RETURN cert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_batch_certificates(p_batch_id uuid, p_issued_by uuid DEFAULT NULL::uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_record RECORD;
  issued_count INTEGER := 0;
BEGIN
  -- Issue certificates for all completed participants without certificates
  FOR participant_record IN
    SELECT user_id
    FROM batch_participants
    WHERE batch_id = p_batch_id
    AND completion_status = 'completed'
    AND certificate_issued = FALSE
  LOOP
    BEGIN
      PERFORM issue_batch_certificate(p_batch_id, participant_record.user_id, p_issued_by);
      issued_count := issued_count + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other participants
      RAISE NOTICE 'Failed to issue certificate for user %: %', participant_record.user_id, SQLERRM;
    END;
  END LOOP;

  RETURN issued_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;