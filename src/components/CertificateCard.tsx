import { Certificate } from '@/hooks/useCertificates';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Share2, Award, Calendar, Hash, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { QRCodeGenerator } from './QRCodeGenerator';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificate: Certificate) => void;
  onView?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  showActions?: boolean;
  showQRCode?: boolean;
}

export const CertificateCard = ({ 
  certificate, 
  onDownload, 
  onView, 
  onShare,
  showActions = true,
  showQRCode = false
}: CertificateCardProps) => {
  const [showQR, setShowQR] = useState(false);
  const issuedDate = format(new Date(certificate.issued_at), 'MMM dd, yyyy');
  const completedDate = certificate.completed_at ? format(new Date(certificate.completed_at), 'MMM dd, yyyy') : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
            <h3 className="font-semibold text-sm text-foreground">
              {certificate.courses?.title || 'Course Certificate'}
            </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {certificate.certificate_number}
                </Badge>
                <Badge 
                  variant={certificate.status === 'active' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {certificate.status}
                </Badge>
              </div>
            </div>
          </div>
          {certificate.courses?.poster_url && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
              <img 
                src={certificate.courses.poster_url} 
                alt={certificate.courses.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Certificate Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Issued</p>
                <p className="font-medium">{issuedDate}</p>
              </div>
            </div>
            {completedDate && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">{completedDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification Code */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Verification Code</p>
              <p className="text-xs font-mono truncate">
                {certificate.verification_code}
              </p>
            </div>
          </div>

          {/* Metadata */}
          {certificate.metadata && Object.keys(certificate.metadata).length > 0 && (
            <div className="text-xs text-muted-foreground">
              {certificate.metadata.completion_percentage && (
                <p>Completion: {certificate.metadata.completion_percentage}%</p>
              )}
              {certificate.metadata.manually_issued && (
                <p>Manually issued by admin</p>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && certificate.status === 'active' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(certificate)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload?.(certificate)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare?.(certificate)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {showQRCode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="w-full"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>
              )}
            </div>
          )}

          {/* QR Code Section */}
          {showQR && showQRCode && certificate.status === 'active' && (
            <div className="pt-4 border-t">
              <QRCodeGenerator
                verificationCode={certificate.verification_code}
                courseTitle={certificate.courses?.title}
                studentName={certificate.profiles?.full_name}
                className="border-0 shadow-none"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};