import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Download, Eye } from 'lucide-react';

export default function AdminDFTSubmissions() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Fetch DFT submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-dft-submissions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('dft_submissions')
        .select(`
          *,
          profiles(full_name, phone),
          courses(title)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const exportToCSV = () => {
    if (!submissions || submissions.length === 0) {
      return;
    }

    const csvHeaders = [
      'ID',
      'Student Name',
      'Phone',
      'Course',
      'Status',
      'Submission Link',
      'Notes',
      'Submitted At'
    ];

    const csvData = submissions.map(submission => [
      submission.id,
      (submission.profiles as any)?.full_name || 'N/A',
      (submission.profiles as any)?.phone || 'N/A',
      (submission.courses as any)?.title || 'N/A',
      submission.status,
      submission.link || 'N/A',
      submission.notes || 'N/A',
      new Date(submission.created_at).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dft-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'profiles' as const,
      header: 'Student',
      render: (value: any) => (
        <div>
          <p className="font-medium">{value?.full_name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{value?.phone || 'No phone'}</p>
        </div>
      )
    },
    {
      key: 'courses' as const,
      header: 'Course',
      render: (value: any) => value?.title || 'No course'
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'approved' ? 'default' : 
          value === 'rejected' ? 'destructive' : 
          'secondary'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'link' as const,
      header: 'Submission',
      render: (value: string) => (
        value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View Link
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">No link</span>
        )
      )
    },
    {
      key: 'created_at' as const,
      header: 'Submitted',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (submission: any) => setSelectedSubmission(submission)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DFT Submissions</h1>
        <Button onClick={exportToCSV} disabled={!submissions || submissions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Submission Details</h2>
              <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student</label>
                <p className="text-lg">{(selectedSubmission.profiles as any)?.full_name || 'Unknown'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p>{(selectedSubmission.profiles as any)?.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Course</label>
                <p>{(selectedSubmission.courses as any)?.title || 'No course'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' : 
                    selectedSubmission.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Submission Link</label>
                {selectedSubmission.link ? (
                  <p>
                    <a 
                      href={selectedSubmission.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.link}
                    </a>
                  </p>
                ) : (
                  <p className="text-muted-foreground">No link provided</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="whitespace-pre-wrap">{selectedSubmission.notes || 'No notes'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}