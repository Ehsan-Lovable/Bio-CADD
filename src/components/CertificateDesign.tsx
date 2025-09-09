import React from 'react';
import { Certificate } from '@/hooks/useCertificates';
import QRCode from 'qrcode';
import { Award, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface CertificateDesignProps {
  certificate: Certificate & {
    courses?: { title: string } | null;
    course_batches?: { batch_name: string; instructor_name?: string } | null;
    profiles?: { full_name?: string } | null;
  };
  ref?: React.RefObject<HTMLDivElement>;
}

export const CertificateDesign = React.forwardRef<HTMLDivElement, CertificateDesignProps>(
  ({ certificate }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
    
    const courseName = certificate.courses?.title || certificate.course_batches?.batch_name || 'Course Certificate';
    const recipientName = certificate.profiles?.full_name || 'Student';
    const instructor = certificate.course_batches?.instructor_name;
    const issueDate = format(new Date(certificate.issued_at), 'MMMM dd, yyyy');
    const completionDate = certificate.completed_at ? format(new Date(certificate.completed_at), 'MMMM dd, yyyy') : null;

    React.useEffect(() => {
      const generateQR = async () => {
        if (certificate.qr_code_data) {
          try {
            const verificationUrl = `${window.location.origin}${certificate.qr_code_data}`;
            const qrUrl = await QRCode.toDataURL(verificationUrl, {
              width: 150,
              margin: 2,
              color: {
                dark: '#1e40af',
                light: '#ffffff',
              },
            });
            setQrCodeUrl(qrUrl);
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }
      };

      generateQR();
    }, [certificate.qr_code_data]);

    return (
      <div
        ref={ref}
        className="certificate-design w-[800px] h-[600px] bg-white border-8 border-primary p-8 mx-auto shadow-2xl relative"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-4 border-2 border-primary/20 rounded-lg"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-16 w-16 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-primary tracking-wide">
                CERTIFICATE
              </h1>
              <p className="text-lg text-primary/80 font-medium">
                OF COMPLETION
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          <div>
            <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-primary/30 inline-block pb-2 px-8">
              {recipientName}
            </h2>
          </div>

          <div>
            <p className="text-lg text-gray-600 mb-2">has successfully completed the course</p>
            <h3 className="text-2xl font-semibold text-primary mb-4">
              {courseName}
            </h3>
          </div>

          {completionDate && (
            <p className="text-base text-gray-600">
              Completed on <span className="font-semibold">{completionDate}</span>
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          {/* Left side - Issue date and instructor */}
          <div className="text-left">
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Issued on
              </div>
              <p className="font-semibold text-gray-800">{issueDate}</p>
            </div>
            
            {instructor && (
              <div>
                <p className="text-sm text-gray-600">Instructor</p>
                <div className="border-t border-gray-400 pt-1 w-48">
                  <p className="font-semibold text-gray-800">{instructor}</p>
                </div>
              </div>
            )}
          </div>

          {/* Center - Certificate details */}
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
              <Hash className="h-3 w-3 mr-1" />
              Certificate No.
            </div>
            <p className="font-mono text-sm font-semibold text-gray-700">
              {certificate.certificate_number}
            </p>
          </div>

          {/* Right side - QR Code */}
          {qrCodeUrl && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Scan to verify</p>
              <img 
                src={qrCodeUrl} 
                alt="Verification QR Code" 
                className="w-20 h-20 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <Award className="h-64 w-64 text-primary" />
        </div>
      </div>
    );
  }
);

CertificateDesign.displayName = 'CertificateDesign';