import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  verificationCode: string;
  courseTitle?: string;
  studentName?: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  verificationCode,
  courseTitle,
  studentName,
  className = ''
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (!verificationCode) return;

      setLoading(true);
      try {
        const verificationUrl = `${window.location.origin}/verify?code=${verificationCode}`;
        const qrUrl = await QRCode.toDataURL(verificationUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.error('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [verificationCode]);

  const copyVerificationUrl = () => {
    const url = `${window.location.origin}/verify?code=${verificationCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification URL copied to clipboard');
  };

  const copyVerificationCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast.success('Verification code copied to clipboard');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `certificate-qr-${verificationCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Certificate Verification QR Code
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan this QR code to verify the certificate
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <img 
                src={qrCodeUrl} 
                alt="Certificate Verification QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Verification Code</p>
              <p className="font-mono text-lg bg-muted px-3 py-1 rounded">
                {verificationCode}
              </p>
            </div>

            {courseTitle && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{courseTitle}</p>
              </div>
            )}

            {studentName && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">{studentName}</p>
              </div>
            )}

            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyVerificationCode}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyVerificationUrl}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadQRCode}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
