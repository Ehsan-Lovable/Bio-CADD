import { CertificateVerification } from '@/components/CertificateVerification';
import { SEOHead } from '@/components/SEOHead';

export default function CertificateVerify() {
  return (
    <>
      <SEOHead
        title="Certificate Verification | Verify Course Certificates"
        description="Verify the authenticity of course completion certificates. Enter certificate number and verification hash to validate credentials."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Certificate Verification</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verify the authenticity and validity of course completion certificates. 
              Our verification system ensures the credibility of all issued certificates.
            </p>
          </div>
          
          <CertificateVerification />
        </div>
      </div>
    </>
  );
}