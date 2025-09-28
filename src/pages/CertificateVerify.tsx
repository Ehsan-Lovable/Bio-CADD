import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

export default function CertificateVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect to new verification page
    const code = searchParams.get('code');
    const hash = searchParams.get('hash');
    const number = searchParams.get('number');
    
    if (code) {
      // If verification code is provided, redirect to new page
      navigate(`/verify?code=${code}`, { replace: true });
    } else if (hash && number) {
      // If old format is used, show message and redirect
      navigate('/verify', { replace: true });
    } else {
      // No parameters, redirect to new page
      navigate('/verify', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <>
      <SEOHead
        title="Certificate Verification | Bio-CADD"
        description="Verify the authenticity of course completion certificates using verification codes."
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to new verification system...</h1>
          <p className="text-muted-foreground">Please wait while we redirect you to the updated verification page.</p>
        </div>
      </div>
    </>
  );
}