import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  path?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUpload?: (url: string, file: File) => void;
  onRemove?: () => void;
  value?: string;
  className?: string;
  multiple?: boolean;
}

export const FileUpload = ({
  bucket,
  path = '',
  accept = '*/*',
  maxSize = 10,
  onUpload,
  onRemove,
  value,
  className,
  multiple = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Handle single file for now
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      onUpload?.(publicUrl, file);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-1)[0]; // Get the filename
      const fullPath = path ? `${path}/${filePath}` : filePath;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fullPath]);

      if (error) throw error;

      onRemove?.();
      toast.success('File removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove file');
    }
  };

  const isImage = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  return (
    <Card className={`p-6 ${className || ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {isImage(value) ? (
              <div className="flex items-center gap-3 flex-1">
                <img 
                  src={value} 
                  alt="Uploaded file" 
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Image uploaded</p>
                  <p className="text-xs text-muted-foreground">Click to view full size</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <FileIcon className="h-12 w-12 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">File uploaded</p>
                  <p className="text-xs text-muted-foreground">{value}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              {accept.includes('image') ? (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Click to upload file</p>
                <p className="text-xs text-muted-foreground">
                  Max size: {maxSize}MB
                </p>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};