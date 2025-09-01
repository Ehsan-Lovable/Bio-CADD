import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Search, Filter, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [promoteDemoteDialogOpen, setPromoteDemoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'promote' | 'demote'>('promote');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'admin'>('all');

  // Fetch users with enhanced filtering
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter as 'student' | 'admin');
      }

      if (statusFilter === 'active') {
        query = query.eq('role', 'student');
      } else if (statusFilter === 'admin') {
        query = query.eq('role', 'admin');
      }

      const { data, error } = await query;
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
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
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      )
    },
    {
      key: 'phone' as const,
      header: 'Contact',
      render: (value: string, user: any) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-1 text-xs">
              <Phone className="w-3 h-3" />
              {value}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <Mail className="w-3 h-3" />
            {user.email}
          </div>
        </div>
      )
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
      render: (value: string) => (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="w-3 h-3" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
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
      },
      disabled: (user: any) => user.role === 'admin'
    },
    {
      label: 'Demote to Student',
      onClick: (user: any) => {
        if (user.role === 'student') return;
        setSelectedUser(user);
        setActionType('demote');
        setPromoteDemoteDialogOpen(true);
      },
      disabled: (user: any) => user.role === 'student'
    },
    {
      label: 'Delete User',
      onClick: (user: any) => {
        if (confirm(`Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`)) {
          deleteUserMutation.mutate(user.id);
        }
      },
      variant: 'destructive' as const,
      disabled: (user: any) => user.role === 'admin' // Prevent deleting admins
    }
  ];

  const handleRoleChange = () => {
    if (!selectedUser) return;
    
    const newRole = actionType === 'promote' ? 'admin' : 'student';
    updateRoleMutation.mutate({ userId: selectedUser.id, newRole });
  };

  const filteredUsers = users || [];
  const adminCount = filteredUsers.filter(u => u.role === 'admin').length;
  const studentCount = filteredUsers.filter(u => u.role === 'student').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total users: {filteredUsers.length}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={(value: 'all' | 'student' | 'admin') => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'admin') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active Students</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filteredUsers}
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