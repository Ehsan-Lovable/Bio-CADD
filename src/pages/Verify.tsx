import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/SEOHead';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  Award, 
  Calendar, 
  User, 
  BookOpen,
  Copy,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VerificationResult {
  id: string;
  verification_code: string;
  courses?: {
    title: string;
    slug?: string;
  };
  course_batches?: {
    batch_name: string;
    instructor_name?: string;
  };
  profiles?: {
    full_name?: string;
  };
  issued_at: string;
  completed_at?: string;
  status: 'active' | 'revoked';
}

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifiedCertificate, setVerifiedCertificate] = useState<VerificationResult | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);
    try {
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses(title, slug),
          course_batches(batch_name, instructor_name),
          profiles!inner(full_name)
        `)
        .eq('verification_code', verificationCode.trim().toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      if (certificate) {
        setVerifiedCertificate(certificate as VerificationResult);
        setVerificationStatus('verified');
        
        // Record verification attempt
        await supabase
          .from('certificate_verifications')
          .insert({
            certificate_id: certificate.id,
            verifier_info: {
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              verification_code: verificationCode.trim()
            }
          });
      } else {
        setVerifiedCertificate(null);
        setVerificationStatus('invalid');
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      setVerifiedCertificate(null);
      setVerificationStatus('invalid');
      toast.error('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationCode('');
    setVerifiedCertificate(null);
    setVerificationStatus('idle');
  };

  const copyVerificationUrl = () => {
    const url = `${window.location.origin}/verify?code=${verificationCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification URL copied to clipboard');
  };

  return (
    <>
      <SEOHead
        title="Certificate Verification | Bio-CADD"
        description="Verify course completion certificates using verification codes. Check the authenticity of Bio-CADD course certificates."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Certificate Verification</h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Verify the authenticity of course completion certificates issued by Bio-CADD. 
                Enter the verification code to validate credentials.
              </p>
            </div>

            {/* Verification Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Verify Certificate
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code provided with the certificate
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="verification-code"
                      placeholder="e.g., BC-BIO101-ABC123"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      disabled={loading}
                      className="font-mono"
                    />
                    <Button 
                      onClick={handleVerify} 
                      disabled={loading || !verificationCode.trim()}
                      className="px-6"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </div>

                {verificationStatus !== 'idle' && (
                  <Button variant="outline" onClick={handleReset} className="w-full">
                    Reset
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Verification Result - Valid */}
            {verificationStatus === 'verified' && verifiedCertificate && (
              <Card className="border-green-200 bg-green-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    Certificate Verified Successfully
                  </CardTitle>
                  <Badge variant="default" className="w-fit bg-green-100 text-green-800">
                    Valid Certificate
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Certificate Details */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                      <Award className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {verifiedCertificate.courses?.title || 'Course Certificate'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Verification Code: {verifiedCertificate.verification_code}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Awarded to</p>
                          <p className="font-medium">{verifiedCertificate.profiles?.full_name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Completed on</p>
                          <p className="font-medium">
                            {verifiedCertificate.completed_at 
                              ? format(new Date(verifiedCertificate.completed_at), 'MMM dd, yyyy')
                              : format(new Date(verifiedCertificate.issued_at), 'MMM dd, yyyy')
                            }
                          </p>
                        </div>
                      </div>

                      {verifiedCertificate.course_batches?.batch_name && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Batch</p>
                            <p className="font-medium">{verifiedCertificate.course_batches.batch_name}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={copyVerificationUrl}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Verification URL
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.print()}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Print Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Result - Invalid */}
            {verificationStatus === 'invalid' && (
              <Card className="border-red-200 bg-red-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-6 w-6" />
                    Certificate Not Found
                  </CardTitle>
                  <Badge variant="destructive" className="w-fit">
                    Invalid Verification Code
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">
                    The verification code "{verificationCode}" could not be found in our system. 
                    Please check the code and try again, or contact the certificate issuer for assistance.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Verification codes are case-insensitive</p>
                  <p>• Codes are typically in the format: BC-{COURSE}-{CODE}</p>
                  <p>• If you're having trouble, contact the course instructor</p>
                  <p>• Only active certificates can be verified</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
