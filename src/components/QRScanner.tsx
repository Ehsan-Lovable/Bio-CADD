import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Camera access denied or not available. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For demonstration, we'll accept the file but note that actual QR code parsing
    // would require a library like jsQR or qr-scanner
    const reader = new FileReader();
    reader.onload = (e) => {
      // In a real implementation, you would parse the QR code from the image
      // For now, we'll just show an alert
      setError('QR code scanning from images requires additional setup. Please enter certificate details manually.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasPermission === null && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Requesting camera permission...</p>
          </div>
        )}

        {hasPermission === false && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Camera access is required to scan QR codes. Please enable camera permissions and try again.
              </AlertDescription>
            </Alert>
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {hasPermission === true && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 border-2 border-primary rounded-lg"></div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Position the QR code within the frame
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Or upload QR code image</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="qr-upload"
          />
          <label htmlFor="qr-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Choose Image</span>
            </Button>
          </label>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={onClose} className="w-full">
            Enter Manually Instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};