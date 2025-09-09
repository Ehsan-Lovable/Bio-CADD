import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateCard } from '@/components/CertificateCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Search, Download, Eye, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCertificates() {
  const { user } = useAuth();
  const { getUserCertificates, downloadCertificate } = useCertificates();
  
  const [certificates, setCertificates] = useState<any[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCertificates = async () => {
      if (user) {
        setLoading(true);
        const userCertificates = await getUserCertificates();
        setCertificates(userCertificates);
        setFilteredCertificates(userCertificates);
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [user]);

  useEffect(() => {
    let filtered = certificates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, statusFilter]);

  const handleDownload = (certificate: any) => {
    downloadCertificate(certificate);
  };

  const handleView = (certificate: any) => {
    // For now, just download the certificate
    downloadCertificate(certificate);
  };

  const handleShare = (certificate: any) => {
    // Copy verification link to clipboard
    const verifyUrl = `${window.location.origin}/certificate-verify`;
    navigator.clipboard.writeText(
      `Verify my certificate: ${verifyUrl}\nCertificate Number: ${certificate.certificate_number}\nVerification Hash: ${certificate.verification_hash}`
    );
    // You could show a toast here
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <SEOHead
        title="My Certificates | Learning Dashboard"
        description="View and manage all your earned course completion certificates."
      />
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                My Certificates
              </h1>
              <p className="text-muted-foreground mt-2">
                View and download all your earned course completion certificates
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by course name or certificate number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Certificates</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Found</label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                    <span className="text-sm font-medium">
                      {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Grid */}
          {filteredCertificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title={searchTerm || statusFilter !== 'all' ? "No certificates found" : "No certificates yet"}
              description={
                searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Complete courses to earn certificates and showcase your achievements"
              }
              actionLabel={searchTerm || statusFilter !== 'all' ? undefined : "Browse Courses"}
              actionHref={searchTerm || statusFilter !== 'all' ? undefined : "/courses"}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  onDownload={handleDownload}
                  onView={handleView}
                  onShare={handleShare}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}