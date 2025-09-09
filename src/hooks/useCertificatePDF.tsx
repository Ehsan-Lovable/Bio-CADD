import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Certificate } from '@/hooks/useCertificates';
import { toast } from 'sonner';

export const useCertificatePDF = () => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async (
    certificateElement: HTMLElement,
    certificate: Certificate & {
      courses?: { title: string } | null;
      course_batches?: { batch_name: string } | null;
      profiles?: { full_name?: string } | null;
    }
  ): Promise<string> => {
    setGenerating(true);
    try {
      // Generate canvas from the certificate element
      const canvas = await html2canvas(certificateElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 600,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600],
      });

      // Add the certificate image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);

      // Generate filename
      const courseName = certificate.courses?.title || certificate.course_batches?.batch_name || 'Certificate';
      const recipientName = certificate.profiles?.full_name || 'Student';
      const filename = `${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}_${certificate.certificate_number}.pdf`;

      // Save the PDF
      pdf.save(filename);

      toast.success('Certificate PDF downloaded successfully');
      return filename;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFBlob = async (
    certificateElement: HTMLElement
  ): Promise<Blob> => {
    setGenerating(true);
    try {
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 600,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600],
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);

      // Return as blob instead of saving
      return pdf.output('blob');
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    generatePDF,
    generatePDFBlob,
  };
};