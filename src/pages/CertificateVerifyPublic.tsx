import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function CertificateVerifyPublic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [certificateNumber, setCertificateNumber] = useState(searchParams.get('number') || '');
  const [verificationCode, setVerificationCode] = useState(searchParams.get('code') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }
    const params = new URLSearchParams();
    params.set('code', verificationCode.trim().toUpperCase());
    if (certificateNumber.trim()) params.set('number', certificateNumber.trim().toUpperCase());
    navigate(`/verify?${params.toString()}`);
  };

  return (
    <>
      <SEOHead
        title="Verify Certificate | Bio-CADD"
        description="Public certificate verification. Enter your certificate number and verification code to verify."
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Verify Certificate</h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Enter your certificate details to verify authenticity. No sign-in required.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Verification Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="certificate-number">Certificate Number (optional)</Label>
                    <Input
                      id="certificate-number"
                      placeholder="e.g., CERT-2025-000123"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      placeholder="e.g., BC-BIO101-ABC123"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="font-mono"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">Verify</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-3">Tips</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Codes are typically in the format: BC-{`{COURSE}`}-ABC123</p>
                  <p>• Certificate number helps refine results, but is optional</p>
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


