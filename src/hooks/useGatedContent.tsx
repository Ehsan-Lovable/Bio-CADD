import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useGatedContent = (courseId: string) => {
  const { session } = useAuth();

  // Check if user is enrolled or admin
  const { data: access, isLoading } = useQuery({
    queryKey: ['course-access', courseId, session?.user?.id],
    queryFn: async () => {
      if (!session) {
        return { canViewContent: false, isEnrolled: false, isAdmin: false };
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      if (isAdmin) {
        return { canViewContent: true, isEnrolled: false, isAdmin: true };
      }

      // Check enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      const isEnrolled = !!enrollment;

      return { 
        canViewContent: isEnrolled, 
        isEnrolled, 
        isAdmin: false 
      };
    },
    enabled: !!session && !!courseId
  });

  return {
    canViewContent: access?.canViewContent || false,
    isEnrolled: access?.isEnrolled || false,
    isAdmin: access?.isAdmin || false,
    isLoading
  };
};