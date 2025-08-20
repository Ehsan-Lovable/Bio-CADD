import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [promoteDemoteDialogOpen, setPromoteDemoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'promote' | 'demote'>('promote');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'student' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
      setPromoteDemoteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    }
  });

  const columns = [
    {
      key: 'full_name' as const,
      header: 'Name',
      sortable: true,
      render: (value: string, user: any) => (
        <div>
          <p className="font-medium">{value || 'No name'}</p>
          <p className="text-xs text-muted-foreground">{user.id}</p>
        </div>
      )
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      render: (value: string) => value || '-'
    },
    {
      key: 'role' as const,
      header: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'created_at' as const,
      header: 'Joined',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'Promote to Admin',
      onClick: (user: any) => {
        if (user.role === 'admin') return;
        setSelectedUser(user);
        setActionType('promote');
        setPromoteDemoteDialogOpen(true);
      }
    },
    {
      label: 'Demote to Student',
      onClick: (user: any) => {
        if (user.role === 'student') return;
        setSelectedUser(user);
        setActionType('demote');
        setPromoteDemoteDialogOpen(true);
      }
    }
  ];

  const handleRoleChange = () => {
    if (!selectedUser) return;
    
    const newRole = actionType === 'promote' ? 'admin' : 'student';
    updateRoleMutation.mutate({ userId: selectedUser.id, newRole });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="text-sm text-muted-foreground">
          Total users: {users?.length || 0}
        </div>
      </div>

      <DataTable
        data={users || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search users..."
        emptyMessage="No users found"
      />

      <ConfirmDialog
        open={promoteDemoteDialogOpen}
        onOpenChange={setPromoteDemoteDialogOpen}
        title={actionType === 'promote' ? 'Promote to Admin' : 'Demote to Student'}
        description={
          actionType === 'promote' 
            ? `Are you sure you want to promote "${selectedUser?.full_name || 'this user'}" to admin? They will have full access to the admin panel.`
            : `Are you sure you want to demote "${selectedUser?.full_name || 'this user'}" to student? They will lose admin access.`
        }
        confirmText={actionType === 'promote' ? 'Promote' : 'Demote'}
        onConfirm={handleRoleChange}
        variant={actionType === 'demote' ? 'destructive' : 'default'}
      />
    </div>
  );
}