import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useEnrollment = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  const enroll = async (courseId: string) => {
    // This function now just checks if user has already submitted enrollment form
    if (!session) {
      toast.error('Please sign in to enroll in courses');
      navigate('/auth');
      return false;
    }

    // Check if user has already submitted enrollment for this course
    try {
      const { data: existingSubmission } = await supabase
        .from('enrollment_submissions')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (existingSubmission) {
        toast.info(`You have already submitted an enrollment form for this course. Status: ${existingSubmission.status}`);
        return false;
      }
      
      return true; // Allow opening enrollment form
    } catch (error: any) {
      console.error('Error checking enrollment status:', error);
      return true; // Allow enrollment if check fails
    }
  };

  const checkEnrollment = async (courseId: string) => {
    if (!session) return { isEnrolled: false, hasSubmitted: false, status: null };

    try {
      // Check enrollment submissions first
      const { data: submission, error: submissionError } = await supabase
        .from('enrollment_submissions')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        throw submissionError;
      }

      if (submission) {
        return {
          isEnrolled: submission.status === 'approved',
          hasSubmitted: true,
          status: submission.status
        };
      }

      // Fallback to old enrollments table for backwards compatibility
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (enrollmentError && enrollmentError.code !== 'PGRST116') {
        throw enrollmentError;
      }

      return {
        isEnrolled: enrollment ? enrollment.status === 'active' : false,
        hasSubmitted: false,
        status: enrollment?.status || null
      };
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return { isEnrolled: false, hasSubmitted: false, status: null };
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    if (!session) {
      toast.error('Please sign in to upload files');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const { data, error } = await supabase.functions.invoke('upload-storage', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
      return null;
    }
  };

  return {
    enroll,
    checkEnrollment,
    uploadFile,
    isEnrolling
  };
};