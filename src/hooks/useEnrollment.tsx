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
    if (!session) {
      toast.error('Please sign in to enroll in courses');
      navigate('/auth');
      return false;
    }

    setIsEnrolling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enroll', {
        body: { courseId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      toast.success(data.message);
      
      // Redirect to dashboard if specified
      if (data.redirect) {
        navigate(data.redirect);
      }
      
      return true;
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'Failed to enroll in course');
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  const checkEnrollment = async (courseId: string) => {
    if (!session) return false;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? data.status === 'active' : false;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
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