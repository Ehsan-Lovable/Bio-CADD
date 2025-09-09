-- Create course batches table for live courses
CREATE TABLE public.course_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  instructor_name TEXT,
  max_participants INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(course_id, batch_number)
);

-- Create batch participants table
CREATE TABLE public.batch_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.course_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_status TEXT NOT NULL DEFAULT 'enrolled' CHECK (completion_status IN ('enrolled', 'completed', 'dropped')),
  completion_date TIMESTAMP WITH TIME ZONE,
  attendance_percentage NUMERIC(5,2) DEFAULT 0.00,
  final_grade TEXT,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(batch_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.course_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_batches
CREATE POLICY "Admins can manage all batches" 
ON public.course_batches 
FOR ALL 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Users can view batches of published courses" 
ON public.course_batches 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_batches.course_id 
    AND c.status = 'published'::course_status
  )
);

-- RLS policies for batch_participants
CREATE POLICY "Admins can manage all participants" 
ON public.batch_participants 
FOR ALL 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Users can view their own participation" 
ON public.batch_participants 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation status" 
ON public.batch_participants 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add QR code field to certificates table
ALTER TABLE public.certificates ADD COLUMN qr_code_data TEXT;

-- Add batch_id to certificates for batch-issued certificates
ALTER TABLE public.certificates ADD COLUMN batch_id UUID REFERENCES public.course_batches(id);

-- Update certificates table to support both individual and batch issuance
ALTER TABLE public.certificates ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_course_or_batch_check 
CHECK (
  (course_id IS NOT NULL AND batch_id IS NULL) OR 
  (course_id IS NULL AND batch_id IS NOT NULL)
);

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_course_batches_updated_at
BEFORE UPDATE ON public.course_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate batch-specific certificate
CREATE OR REPLACE FUNCTION public.issue_batch_certificate(
  p_batch_id UUID,
  p_user_id UUID,
  p_issued_by UUID DEFAULT NULL
) RETURNS UUID
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

-- Create function for bulk batch certificate issuance
CREATE OR REPLACE FUNCTION public.issue_batch_certificates(
  p_batch_id UUID,
  p_issued_by UUID DEFAULT NULL
) RETURNS INTEGER
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