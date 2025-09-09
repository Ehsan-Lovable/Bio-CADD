import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCertificates, Certificate } from '@/hooks/useCertificates';
import { Shield, CheckCircle, XCircle, Search, Award, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export const CertificateVerification = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationHash, setVerificationHash] = useState('');
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'invalid'>('idle');
  
  const { verifyCertificate, loading } = useCertificates();

  const handleVerify = async () => {
    if (!certificateNumber.trim() || !verificationHash.trim()) {
      return;
    }

    const result = await verifyCertificate(certificateNumber.trim(), verificationHash.trim());
    
    if (result) {
      setVerifiedCertificate(result);
      setVerificationStatus('verified');
    } else {
      setVerifiedCertificate(null);
      setVerificationStatus('invalid');
    }
  };

  const handleReset = () => {
    setCertificateNumber('');
    setVerificationHash('');
    setVerifiedCertificate(null);
    setVerificationStatus('idle');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certificate Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify the authenticity of a certificate by entering the certificate number and verification hash.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificate-number">Certificate Number</Label>
              <Input
                id="certificate-number"
                placeholder="e.g., CERT-2024-123456"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-hash">Verification Hash</Label>
              <Input
                id="verification-hash"
                placeholder="Enter verification hash"
                value={verificationHash}
                onChange={(e) => setVerificationHash(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleVerify} 
              disabled={loading || !certificateNumber.trim() || !verificationHash.trim()}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </Button>
            {verificationStatus !== 'idle' && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationStatus === 'verified' && verifiedCertificate && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Certificate Verified
            </CardTitle>
            <Badge variant="default" className="w-fit bg-green-100 text-green-800">
              Valid Certificate
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Award className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">{verifiedCertificate.courses?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Certificate #{verifiedCertificate.certificate_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Awarded to</p>
                    <p className="font-medium">{verifiedCertificate.profiles?.full_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Issued on</p>
                    <p className="font-medium">
                      {format(new Date(verifiedCertificate.issued_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {verifiedCertificate.completed_at && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed on</p>
                      <p className="font-medium">
                        {format(new Date(verifiedCertificate.completed_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {verifiedCertificate.metadata && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Additional Information</p>
                  {verifiedCertificate.metadata.completion_percentage && (
                    <p className="text-sm">
                      Completion Rate: {verifiedCertificate.metadata.completion_percentage}%
                    </p>
                  )}
                  {verifiedCertificate.metadata.total_lessons && (
                    <p className="text-sm">
                      Lessons Completed: {verifiedCertificate.metadata.completed_lessons || 0} / {verifiedCertificate.metadata.total_lessons}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === 'invalid' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Certificate Invalid
            </CardTitle>
            <Badge variant="destructive" className="w-fit">
              Invalid Certificate
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              The certificate number and verification hash combination could not be verified. 
              Please check the details and try again, or contact the certificate issuer for assistance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};