import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateCard } from '@/components/CertificateCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { 
  Award, 
  Search, 
  Download, 
  Eye, 
  Plus,
  Ban,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const { 
    getAllCertificates, 
    issueCertificate, 
    revokeCertificate, 
    downloadCertificate 
  } = useCertificates();

  useEffect(() => {
    fetchCertificates();
    fetchCoursesAndUsers();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    const data = await getAllCertificates();
    setCertificates(data);
    setLoading(false);
  };

  const fetchCoursesAndUsers = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        supabase.from('courses').select('id, title, slug').eq('status', 'published'),
        supabase.from('profiles').select('id, full_name').order('full_name')
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (usersRes.data) setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching courses and users:', error);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedUser || !selectedCourse) {
      toast.error('Please select both user and course');
      return;
    }

    const result = await issueCertificate(selectedUser, selectedCourse);
    if (result) {
      setShowIssueDialog(false);
      setSelectedUser('');
      setSelectedCourse('');
      fetchCertificates();
      
      // Show the generated verification code
      if (result.verification_code) {
        toast.success(`Certificate issued! Verification code: ${result.verification_code}`, {
          duration: 10000,
        });
      }
    }
  };

  const handleRevokeCertificate = async (certificateId: string, reason: string) => {
    const success = await revokeCertificate(certificateId, reason);
    if (success) {
      fetchCertificates();
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = !searchTerm || 
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.verification_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'verification_code',
      accessorKey: 'verification_code',
      header: 'Verification Code',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div 
            className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded border cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(row.getValue('verification_code'));
              toast.success('Verification code copied to clipboard');
            }}
          >
            {row.getValue('verification_code')}
          </div>
          <div className="text-xs text-muted-foreground">
            Click to copy
          </div>
        </div>
      ),
    },
    {
      key: 'certificate_number',
      accessorKey: 'certificate_number',
      header: 'Certificate #',
      cell: ({ row }: any) => (
        <div className="font-mono text-xs">{row.getValue('certificate_number')}</div>
      ),
    },
    {
      key: 'course',
      accessorKey: 'courses.title',
      header: 'Course',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.courses?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'student',
      accessorKey: 'profiles.full_name',
      header: 'Student',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.profiles?.full_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.getValue('status') === 'active' ? 'default' : 'destructive'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      key: 'issued_at',
      accessorKey: 'issued_at',
      header: 'Issued',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(row.getValue('issued_at')), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const certificate = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCertificate(certificate)}
            >
              <Download className="h-4 w-4" />
            </Button>
            {certificate.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRevokeCertificate(certificate.id, 'Revoked by admin')}
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <p className="text-muted-foreground">
            Manage course completion certificates and verification
          </p>
        </div>
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">Student</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleIssueCertificate}
                  disabled={!selectedUser || !selectedCourse}
                  className="flex-1"
                >
                  Issue Certificate
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowIssueDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by verification code, certificate #, course, or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificates ({filteredCertificates.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates found"
              description={searchTerm || selectedStatus !== 'all' 
                ? "No certificates match your filters" 
                : "No certificates have been issued yet"
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={filteredCertificates}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}