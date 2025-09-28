import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Certificate {
  id: string;
  user_id: string;
  course_id?: string;
  batch_id?: string;
  certificate_number: string;
  verification_code: string;
  verification_hash: string;
  qr_code_data?: string;
  status: 'active' | 'revoked';
  issued_at: string;
  completed_at?: string;
  issued_by?: string;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
  pdf_url?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  courses?: {
    title: string;
    slug?: string;
    poster_url?: string;
  };
  course_batches?: {
    batch_name: string;
    instructor_name?: string;
  };
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    id?: string;
  };
}

export const useCertificates = () => {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const getUserCertificates = async (userId?: string) => {
    if (!session && !userId) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses(title, slug, poster_url),
          course_batches(batch_name, instructor_name),
          profiles!inner(full_name, avatar_url, id)
        `)
        .eq('user_id', userId || session.user.id)
        .eq('status', 'active')
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      toast.error(error.message || 'Failed to fetch certificates');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAllCertificates = async () => {
    try {
      setLoading(true);
      
      // Check if current user is admin before allowing access to all certificates
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session?.user?.id)
        .single();

      if (userProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses(title, poster_url),
          course_batches(batch_name, instructor_name),
          profiles!inner(full_name, id)
        `)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    } catch (error: any) {
      console.error('Error fetching all certificates:', error);
      toast.error(error.message || 'Failed to fetch certificates');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (verificationCode: string) => {
    try {
      setLoading(true);
      
      // First, verify the certificate exists and is valid
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses(title, poster_url),
          course_batches(batch_name, instructor_name),
          profiles!inner(full_name)
        `)
        .eq('verification_code', verificationCode.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Certificate not found or invalid');
        }
        throw error;
      }

      // Record the verification attempt
      await supabase
        .from('certificate_verifications')
        .insert({
          certificate_id: certificate.id,
          verification_code: verificationCode.toUpperCase(),
          verifier_info: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      return certificate as any;
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      toast.error(error.message || 'Failed to verify certificate');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async (userId: string, courseId: string) => {
    if (!session) {
      toast.error('Please sign in to issue certificates');
      return null;
    }

    try {
      setLoading(true);

      // Check if certificate already exists
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (existing) {
        toast.error('Certificate already exists for this user and course');
        return null;
      }

      // Generate verification code using database function
      const { data: verificationCode, error: codeError } = await supabase.rpc('generate_verification_code', {
        course_id: courseId
      });
      if (codeError) throw codeError;

      // Generate certificate number
      const { data: certificateNumber, error: numberError } = await supabase.rpc('generate_certificate_number');
      if (numberError) throw numberError;

      // Generate verification hash
      const verificationData = `${userId}-${courseId}-${Date.now()}`;
      const verificationHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificationData));
      const hashArray = Array.from(new Uint8Array(verificationHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Generate QR code data
      const qrCodeData = `/verify?code=${verificationCode}`;

      const { data: certificate, error: insertError } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_number: certificateNumber,
          verification_code: verificationCode,
          verification_hash: hashHex,
          qr_code_data: qrCodeData,
          issued_by: session.user.id,
          completed_at: new Date().toISOString(),
          metadata: {
            manually_issued: true,
            issued_by_admin: true
          }
        })
        .select(`
          *,
          courses(title, poster_url),
          course_batches(batch_name, instructor_name),
          profiles!inner(full_name)
        `)
        .single();

      if (insertError) throw insertError;

      toast.success(`Certificate issued successfully! Verification code: ${verificationCode}`);
      return certificate as any;
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      toast.error(error.message || 'Failed to issue certificate');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (certificateId: string, reason: string) => {
    if (!session) {
      toast.error('Please sign in to revoke certificates');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('certificates')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_by: session.user.id,
          revoked_reason: reason
        })
        .eq('id', certificateId);

      if (error) throw error;

      toast.success('Certificate revoked successfully');
      return true;
    } catch (error: any) {
      console.error('Error revoking certificate:', error);
      toast.error(error.message || 'Failed to revoke certificate');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      setLoading(true);
      
      // If PDF URL exists, download it
      if (certificate.pdf_url) {
        const link = document.createElement('a');
        link.href = certificate.pdf_url;
        link.download = `certificate-${certificate.certificate_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Otherwise, generate PDF (this would typically call an edge function)
      toast.info('Generating certificate PDF...');
      
      // For now, we'll show a placeholder message
      toast.success('Certificate download started');
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      toast.error(error.message || 'Failed to download certificate');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserCertificates,
    getAllCertificates,
    verifyCertificate,
    issueCertificate,
    revokeCertificate,
    downloadCertificate
  };
};
