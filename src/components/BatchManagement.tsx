import { useState, useEffect } from 'react';
import { useBatches, CourseBatch, BatchParticipant } from '@/hooks/useBatches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { 
  Users, 
  Plus, 
  Calendar, 
  Award,
  Edit,
  Trash2,
  UserPlus,
  FileCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BatchManagementProps {
  courseId: string;
  courseTitle: string;
  isLiveCourse?: boolean;
}

export const BatchManagement = ({ courseId, courseTitle, isLiveCourse = false }: BatchManagementProps) => {
  const {
    loading,
    getBatchesByCourse,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant,
    issueBatchCertificates,
    issueSingleBatchCertificate
  } = useBatches();

  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<CourseBatch | null>(null);
  const [participants, setParticipants] = useState<BatchParticipant[]>([]);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    batch_name: '',
    batch_number: '',
    start_date: '',
    end_date: '',
    instructor_name: '',
    max_participants: 50
  });
  const [participantFormData, setParticipantFormData] = useState({
    user_id: '',
    participant_name: '',
    participant_email: '',
    completion_status: 'enrolled' as const
  });

  useEffect(() => {
    fetchBatches();
  }, [courseId]);

  useEffect(() => {
    if (selectedBatch) {
      fetchParticipants(selectedBatch.id);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const batchData = await getBatchesByCourse(courseId);
      setBatches(batchData);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchParticipants = async (batchId: string) => {
    try {
      const participantData = await getBatchParticipants(batchId);
      setParticipants(participantData);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleCreateBatch = async () => {
    try {
      await createBatch({
        course_id: courseId,
        ...batchFormData,
        status: 'active'
      });
      setShowCreateBatch(false);
      setBatchFormData({
        batch_name: '',
        batch_number: '',
        start_date: '',
        end_date: '',
        instructor_name: '',
        max_participants: 50
      });
      fetchBatches();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedBatch) return;
    
    try {
      await addParticipant({
        batch_id: selectedBatch.id,
        ...participantFormData,
        attendance_percentage: 0,
        certificate_issued: false
      });
      setShowAddParticipant(false);
      setParticipantFormData({
        user_id: '',
        participant_name: '',
        participant_email: '',
        completion_status: 'enrolled'
      });
      fetchParticipants(selectedBatch.id);
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleUpdateParticipantStatus = async (participantId: string, completion_status: BatchParticipant['completion_status']) => {
    try {
      await updateParticipant(participantId, { 
        completion_status,
        completion_date: completion_status === 'completed' ? new Date().toISOString() : undefined
      });
      if (selectedBatch) {
        fetchParticipants(selectedBatch.id);
      }
    } catch (error) {
      console.error('Error updating participant:', error);
    }
  };

  const handleIssueBatchCertificates = async () => {
    if (!selectedBatch) return;
    
    try {
      const count = await issueBatchCertificates(selectedBatch.id);
      if (count > 0) {
        fetchParticipants(selectedBatch.id);
      }
    } catch (error) {
      console.error('Error issuing certificates:', error);
    }
  };

  const batchColumns = [
    {
      key: 'batch_name' as keyof CourseBatch,
      header: 'Batch Name',
    },
    {
      key: 'batch_number' as keyof CourseBatch,
      header: 'Batch #',
    },
    {
      key: 'start_date' as keyof CourseBatch,
      header: 'Start Date',
      render: (value: any) => value ? format(new Date(value), 'MMM dd, yyyy') : '-',
    },
    {
      key: 'status' as keyof CourseBatch,
      header: 'Status',
      render: (value: any) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'instructor_name' as keyof CourseBatch,
      header: 'Instructor',
      render: (value: any) => value || '-',
    },
  ];

  const batchActions = [
    {
      label: 'Manage Participants',
      onClick: (batch: CourseBatch) => setSelectedBatch(batch),
    },
  ];

  const participantColumns = [
    {
      key: 'participant_name' as keyof BatchParticipant,
      header: 'Name',
    },
    {
      key: 'participant_email' as keyof BatchParticipant,
      header: 'Email',
    },
    {
      key: 'completion_status' as keyof BatchParticipant,
      header: 'Status',
      render: (value: any, row: BatchParticipant) => (
        <Select
          value={value}
          onValueChange={(newValue) => handleUpdateParticipantStatus(row.id, newValue as BatchParticipant['completion_status'])}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'certificate_issued' as keyof BatchParticipant,
      header: 'Certificate',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          {value ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Issued
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Not Issued
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'enrollment_date' as keyof BatchParticipant,
      header: 'Enrolled',
      render: (value: any) => format(new Date(value), 'MMM dd, yyyy'),
    },
  ];

  if (!isLiveCourse) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={Calendar}
            title="Batch Management Not Available"
            description="Batch management is only available for live courses. This appears to be a recorded course."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Course Batches - {courseTitle}
            </CardTitle>
            <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batch_name">Batch Name</Label>
                    <Input
                      id="batch_name"
                      value={batchFormData.batch_name}
                      onChange={(e) => setBatchFormData(prev => ({ ...prev, batch_name: e.target.value }))}
                      placeholder="e.g., Morning Batch, Weekend Batch"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="batch_number">Batch Number</Label>
                    <Input
                      id="batch_number"
                      value={batchFormData.batch_number}
                      onChange={(e) => setBatchFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                      placeholder="e.g., BATCH-001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={batchFormData.start_date}
                        onChange={(e) => setBatchFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={batchFormData.end_date}
                        onChange={(e) => setBatchFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instructor_name">Instructor Name</Label>
                    <Input
                      id="instructor_name"
                      value={batchFormData.instructor_name}
                      onChange={(e) => setBatchFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                      placeholder="Instructor name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={batchFormData.max_participants}
                      onChange={(e) => setBatchFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateBatch(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBatch} disabled={loading}>
                    Create Batch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : batches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No batches created"
              description="Create your first batch to start managing participants and issuing certificates."
              action={{
                label: "Create Batch",
                onClick: () => setShowCreateBatch(true)
              }}
            />
          ) : (
            <DataTable columns={batchColumns} data={batches} actions={batchActions} />
          )}
        </CardContent>
      </Card>

      {/* Participant Management */}
      {selectedBatch && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants - {selectedBatch.batch_name}
              </CardTitle>
              <div className="flex gap-2">
                <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Participant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Participant</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="participant_name">Name</Label>
                        <Input
                          id="participant_name"
                          value={participantFormData.participant_name}
                          onChange={(e) => setParticipantFormData(prev => ({ ...prev, participant_name: e.target.value }))}
                          placeholder="Participant name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="participant_email">Email</Label>
                        <Input
                          id="participant_email"
                          type="email"
                          value={participantFormData.participant_email}
                          onChange={(e) => setParticipantFormData(prev => ({ ...prev, participant_email: e.target.value }))}
                          placeholder="Participant email"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="user_id">User ID (Optional)</Label>
                        <Input
                          id="user_id"
                          value={participantFormData.user_id}
                          onChange={(e) => setParticipantFormData(prev => ({ ...prev, user_id: e.target.value }))}
                          placeholder="Link to existing user account"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddParticipant(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddParticipant} disabled={loading}>
                        Add Participant
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleIssueBatchCertificates} disabled={loading}>
                  <Award className="h-4 w-4 mr-2" />
                  Issue Certificates
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No participants added"
                description="Add participants to this batch to start tracking their progress."
                action={{
                  label: "Add Participant",
                  onClick: () => setShowAddParticipant(true)
                }}
              />
            ) : (
              <DataTable columns={participantColumns} data={participants} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};