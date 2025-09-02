import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Download, Eye, Users, BookOpen, Calendar, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubmissions() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [actionSubmission, setActionSubmission] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const queryClient = useQueryClient();

  const handleViewScreenshot = async (url: string) => {
    try {
      console.log('Attempting to view screenshot:', url);
      
      // Check if the documents bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        toast.error('Unable to access storage. Please contact support.');
        return;
      }
      
      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      if (!documentsBucket) {
        console.error('Documents bucket not found');
        toast.error('Storage bucket not found. Please run the database migration to fix this issue.');
        return;
      }
      
      // Extract the file path from the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      console.log('URL parts:', pathParts);
      
      // Look for the file path after 'documents' in the URL
      let filePath = '';
      const documentsIndex = pathParts.findIndex(part => part === 'documents');
      
      if (documentsIndex !== -1 && documentsIndex < pathParts.length - 1) {
        // Get everything after 'documents'
        filePath = pathParts.slice(documentsIndex + 1).join('/');
        console.log('Extracted file path:', filePath);
        
        // Try to create a signed URL for admin access
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600);
        
        if (!error && data?.signedUrl) {
          console.log('Successfully created signed URL');
          window.open(data.signedUrl, '_blank');
          return;
        } else {
          console.warn('Signed URL creation failed:', error);
          toast.error(`Failed to generate secure link: ${error?.message || 'Unknown error'}`);
        }
      } else {
        console.error('Invalid URL format - cannot extract file path');
        toast.error('Invalid screenshot URL format');
      }
      
    } catch (error: any) {
      console.error('Error viewing screenshot:', error);
      toast.error(`Error accessing screenshot: ${error.message}`);
    }
  };

  const handleApproveSubmission = async () => {
    if (!actionSubmission) return;

    try {
      // Update submission status to approved
      const { error: updateError } = await supabase
        .from('enrollment_submissions')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', actionSubmission.id);

      if (updateError) throw updateError;

      // Create enrollment record in the enrollments table
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: actionSubmission.user_id,
          course_id: actionSubmission.course_id,
          status: 'active',
          payment_status: 'paid'
        });

      if (enrollError && enrollError.code !== '23505') { // Ignore duplicate key errors
        throw enrollError;
      }

      toast.success('Enrollment approved successfully!');
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      setActionSubmission(null);
      setActionType(null);
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast.error(error.message || 'Failed to approve submission');
    }
  };

  const handleRejectSubmission = async () => {
    if (!actionSubmission) return;

    try {
      const { error } = await supabase
        .from('enrollment_submissions')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', actionSubmission.id);

      if (error) throw error;

      toast.success('Enrollment rejected');
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      setActionSubmission(null);
      setActionType(null);
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error(error.message || 'Failed to reject submission');
    }
  };

  // Fetch courses for filtering
  const { data: courses } = useQuery({
    queryKey: ['courses-for-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, course_type, status, start_date')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch submissions with enhanced filtering
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-submissions', statusFilter, courseFilter],
    queryFn: async () => {
      let query = supabase
        .from('enrollment_submissions')
        .select(`
          *,
          courses(title, course_type, start_date)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (courseFilter && courseFilter !== 'all') {
        query = query.eq('course_id', courseFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Get course type for selected course
  const selectedCourse = courses?.find(c => c.id === courseFilter);
  const isLiveCourse = selectedCourse?.course_type === 'live';

  // Group submissions by course for statistics
  const submissionsByCourse = submissions?.reduce((acc, submission) => {
    const courseTitle = submission.courses?.title || 'Unknown Course';
    if (!acc[courseTitle]) {
      acc[courseTitle] = {
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        courseType: submission.courses?.course_type || 'unknown'
      };
    }
    acc[courseTitle].total++;
    
    switch (submission.status) {
      case 'submitted':
        acc[courseTitle].submitted++;
        break;
      case 'approved':
        acc[courseTitle].approved++;
        break;
      case 'rejected':
        acc[courseTitle].rejected++;
        break;
    }
    return acc;
  }, {} as Record<string, any>) || {};

  const exportToCSV = () => {
    if (!submissions || submissions.length === 0) {
      return;
    }

    const csvHeaders = [
      'ID',
      'Student Name',
      'Email',
      'Phone',
      'Institution',
      'Course',
      'Status',
      'Payment Screenshot',
      'Created At'
    ];

    const csvData = submissions.map(submission => [
      submission.id,
      (submission.form_data as any)?.full_name || 'N/A',
      (submission.form_data as any)?.email || 'N/A',
      (submission.form_data as any)?.phone || 'N/A',
      (submission.form_data as any)?.institution || 'Not provided',
      submission.courses?.title || 'N/A',
      submission.status,
      submission.payment_screenshot_url || 'N/A',
      new Date(submission.submitted_at || submission.created_at).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'profiles.full_name' as const,
      header: 'Student Name',
      render: (value: string, row: any) => (
        <div className="font-medium text-gray-900">
          {(row.form_data as any)?.full_name || 'N/A'}
        </div>
      )
    },
    {
      key: 'profiles.phone' as const,
      header: 'Phone',
      render: (value: string, row: any) => (
        <div className="text-sm text-gray-700">
          {(row.form_data as any)?.phone || 'N/A'}
        </div>
      )
    },
    {
      key: 'courses.title' as const,
      header: 'Course',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">
              {row.courses?.title || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {row.courses?.course_type === 'live' ? (
                <span className="text-violet-600">Live Course</span>
              ) : (
                <span className="text-blue-600">Recorded Course</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'approved' ? 'default' : 
          value === 'submitted' ? 'secondary' : 
          'destructive'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'payment_screenshot_url' as const,
      header: 'Payment Screenshot',
      render: (value: string) => (
        <div className="text-sm">
          {value ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewScreenshot(value)}
              className="text-blue-600 hover:text-blue-800"
            >
              View Screenshot
            </Button>
          ) : (
            <span className="text-gray-500">No screenshot</span>
          )}
        </div>
      )
    },
    {
      key: 'submitted_at' as const,
      header: 'Submitted',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (submission: any) => setSelectedSubmission(submission)
    },
    {
      label: 'Approve',
      icon: CheckCircle,
      onClick: (submission: any) => {
        setActionSubmission(submission);
        setActionType('approve');
      },
      // Only show for submitted applications
      condition: (submission: any) => submission.status === 'submitted'
    },
    {
      label: 'Reject',
      icon: X,
      onClick: (submission: any) => {
        setActionSubmission(submission);
        setActionType('reject');
      },
      variant: 'destructive' as const,
      // Only show for submitted applications
      condition: (submission: any) => submission.status === 'submitted'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Manage course submissions and participant information</p>
          <div className="mt-2 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Course-Based Submission System:</strong> Submissions are now organized by course type. 
                Live courses support batch-based enrollment with limited seats, while recorded courses offer unlimited access.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Auto-Generated Forms:</strong> If a course doesn't have custom enrollment form fields configured, 
                the system automatically uses standard fields (name, email, phone, institution, payment screenshot). 
                Configure custom fields in <strong>Admin → Enrollment Forms</strong> for specialized requirements.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={exportToCSV} disabled={!submissions || submissions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.filter(c => c.course_type === 'live').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              With batch support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recorded Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.filter(c => c.course_type === 'recorded').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unlimited access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions?.filter(s => s.status === 'submitted').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(submissionsByCourse).map(([courseTitle, stats]) => (
              <div key={courseTitle} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">{courseTitle}</div>
                    <div className="text-sm text-gray-600">
                      {stats.courseType === 'live' ? (
                        <span className="text-violet-600">Live Course</span>
                      ) : (
                        <span className="text-blue-600">Recorded Course</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.submitted}</div>
                    <div className="text-xs text-gray-600">Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.approved}</div>
                    <div className="text-xs text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-xs text-gray-600">Rejected</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course.course_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Type Information */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Course Type</label>
                <div className="mt-1">
                  {selectedCourse.course_type === 'live' ? (
                    <Badge variant="default" className="text-xs">
                      Live Course
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Recorded Course
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <div className="mt-1 text-sm text-gray-600">
                  {selectedCourse.start_date ? 
                    new Date(selectedCourse.start_date).toLocaleDateString() : 
                    'Not set'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={submissions || []}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="Search submissions..."
        emptyMessage="No submissions found"
      />

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Submission Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Student Name</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {(selectedSubmission.form_data as any)?.full_name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {(selectedSubmission.form_data as any)?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {(selectedSubmission.form_data as any)?.phone || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Institution/Organization</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {(selectedSubmission.form_data as any)?.institution || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <div className="mt-1">
                    <div className="text-sm text-gray-900">
                      {selectedSubmission.courses?.title || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {selectedSubmission.courses?.course_type === 'live' ? (
                        <span className="text-violet-600">Live Course</span>
                      ) : (
                        <span className="text-blue-600">Recorded Course</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={
                      selectedSubmission.status === 'approved' ? 'default' : 
                      selectedSubmission.status === 'submitted' ? 'secondary' : 
                      'destructive'
                    }>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Submission Link</label>
                  <div className="mt-1">
                    {selectedSubmission.submission_link ? (
                      <a 
                        href={selectedSubmission.submission_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View Submission
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">No link provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Submitted At</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Actions */}
      <ConfirmDialog
        open={!!actionSubmission && !!actionType}
        onOpenChange={() => {
          setActionSubmission(null);
          setActionType(null);
        }}
        title={actionType === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
        description={
          actionType === 'approve' 
            ? `Are you sure you want to approve this enrollment application? The student will be enrolled in the course and can access all content.`
            : `Are you sure you want to reject this enrollment application? The student will be notified and cannot access the course content.`
        }
        confirmText={actionType === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={actionType === 'approve' ? handleApproveSubmission : handleRejectSubmission}
        variant={actionType === 'reject' ? 'destructive' : 'default'}
      />
    </div>
  );
}
