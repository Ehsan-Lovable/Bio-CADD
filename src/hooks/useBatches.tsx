import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseBatch {
  id: string;
  course_id: string;
  batch_name: string;
  batch_number: string;
  start_date?: string;
  end_date?: string;
  instructor_name?: string;
  max_participants: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by?: string;
  courses?: {
    title: string;
    slug: string;
  };
}

export interface BatchParticipant {
  id: string;
  batch_id: string;
  user_id: string;
  participant_name: string;
  participant_email: string;
  enrollment_date: string;
  completion_status: 'enrolled' | 'completed' | 'dropped';
  completion_date?: string;
  attendance_percentage: number;
  final_grade?: string;
  certificate_issued: boolean;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const useBatches = () => {
  const [loading, setLoading] = useState(false);

  const getBatchesByCourse = async (courseId: string): Promise<CourseBatch[]> => {
    const { data, error } = await supabase
      .from('course_batches')
      .select(`
        *,
        courses!inner(title, slug)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch batches');
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as CourseBatch['status']
    }));
  };

  const getAllBatches = async (): Promise<CourseBatch[]> => {
    const { data, error } = await supabase
      .from('course_batches')
      .select(`
        *,
        courses!inner(title, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch batches');
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as CourseBatch['status']
    }));
  };

  const createBatch = async (batchData: Omit<CourseBatch, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<CourseBatch> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_batches')
        .insert([batchData])
        .select()
        .single();

      if (error) throw error;

      const result = {
        ...data,
        status: data.status as CourseBatch['status']
      };

      toast.success('Batch created successfully');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBatch = async (batchId: string, updates: Partial<CourseBatch>): Promise<CourseBatch> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_batches')
        .update(updates)
        .eq('id', batchId)
        .select()
        .single();

      if (error) throw error;

      const result = {
        ...data,
        status: data.status as CourseBatch['status']
      };

      toast.success('Batch updated successfully');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update batch');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (batchId: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('course_batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;

      toast.success('Batch deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete batch');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBatchParticipants = async (batchId: string): Promise<BatchParticipant[]> => {
    const { data, error } = await supabase
      .from('batch_participants')
      .select(`
        *
      `)
      .eq('batch_id', batchId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      toast.error('Failed to fetch participants');
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      completion_status: item.completion_status as BatchParticipant['completion_status']
    }));
  };

  const addParticipant = async (participantData: Omit<BatchParticipant, 'id' | 'created_at' | 'enrollment_date'>): Promise<BatchParticipant> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('batch_participants')
        .insert([participantData])
        .select()
        .single();

      if (error) throw error;

      const result = {
        ...data,
        completion_status: data.completion_status as BatchParticipant['completion_status']
      };

      toast.success('Participant added successfully');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add participant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateParticipant = async (participantId: string, updates: Partial<BatchParticipant>): Promise<BatchParticipant> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('batch_participants')
        .update(updates)
        .eq('id', participantId)
        .select()
        .single();

      if (error) throw error;

      const result = {
        ...data,
        completion_status: data.completion_status as BatchParticipant['completion_status']
      };

      toast.success('Participant updated successfully');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update participant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (participantId: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('batch_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast.success('Participant removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove participant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const issueBatchCertificates = async (batchId: string): Promise<number> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('issue_batch_certificates', {
        p_batch_id: batchId
      });

      if (error) throw error;

      const count = data || 0;
      toast.success(`${count} certificates issued successfully`);
      return count;
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue certificates');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const issueSingleBatchCertificate = async (batchId: string, userId: string): Promise<string> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('issue_batch_certificate', {
        p_batch_id: batchId,
        p_user_id: userId
      });

      if (error) throw error;

      toast.success('Certificate issued successfully');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue certificate');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getBatchesByCourse,
    getAllBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant,
    issueBatchCertificates,
    issueSingleBatchCertificate
  };
};