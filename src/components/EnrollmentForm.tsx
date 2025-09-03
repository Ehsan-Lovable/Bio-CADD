import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign } from 'lucide-react';

interface EnrollmentFormProps {
  courseId: string;
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  field_options: any; // Use any to handle Json type from Supabase
  is_required: boolean;
  field_order: number;
}

const createFormSchema = (fields: FormField[]) => {
  const schemaObject: Record<string, any> = {};
  
  fields.forEach(field => {
    let fieldSchema;
    
    switch (field.field_type) {
      case 'email':
        fieldSchema = z.string().email('Please enter a valid email address');
        break;
      case 'tel':
        fieldSchema = z.string().min(1, 'Phone number is required');
        break;
      case 'file':
        fieldSchema = z.string().url('Please upload a valid file');
        break;
      default:
        fieldSchema = z.string().min(1, `${field.field_label} is required`);
    }
    
    if (!field.is_required) {
      fieldSchema = fieldSchema.optional().or(z.literal(''));
    }
    
    schemaObject[field.field_name as string] = fieldSchema;
  });
  
  return z.object(schemaObject);
};

// Create a type for the form data
type FormData = Record<string, any>;

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  courseId,
  course,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default form fields if none are configured
  const defaultFormFields: FormField[] = [
    {
      id: 'default-1',
      field_name: 'full_name',
      field_type: 'text',
      field_label: 'Full Name',
      field_options: [],
      is_required: true,
      field_order: 1
    },
    {
      id: 'default-2',
      field_name: 'email',
      field_type: 'email',
      field_label: 'Email',
      field_options: [],
      is_required: true,
      field_order: 2
    },
    {
      id: 'default-3',
      field_name: 'discipline',
      field_type: 'text',
      field_label: 'Discipline',
      field_options: [],
      is_required: true,
      field_order: 3
    },
    {
      id: 'default-4',
      field_name: 'university',
      field_type: 'text',
      field_label: 'University',
      field_options: [],
      is_required: true,
      field_order: 4
    },
    {
      id: 'default-5',
      field_name: 'phone',
      field_type: 'tel',
      field_label: 'Phone',
      field_options: [],
      is_required: true,
      field_order: 5
    },
    {
      id: 'default-6',
      field_name: 'messenger_whatsapp',
      field_type: 'text',
      field_label: 'Messenger/WhatsApp',
      field_options: [],
      is_required: true,
      field_order: 6
    },
    {
      id: 'default-7',
      field_name: 'telegram',
      field_type: 'text',
      field_label: 'Telegram',
      field_options: [],
      is_required: false,
      field_order: 7
    },
    {
      id: 'default-8',
      field_name: 'country',
      field_type: 'select',
      field_label: 'Country',
      field_options: [
        'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
        'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
        'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
        'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France',
        'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Hungary', 'Iceland', 'India', 'Indonesia',
        'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
        'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Nepal',
        'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Peru',
        'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
        'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
        'Syria', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
        'Uruguay', 'Venezuela', 'Vietnam', 'Yemen', 'Other'
      ],
      is_required: true,
      field_order: 8
    },
    {
      id: 'default-9',
      field_name: 'state',
      field_type: 'text',
      field_label: 'Current State',
      field_options: [],
      is_required: true,
      field_order: 9
    },
    {
      id: 'default-10',
      field_name: 'city',
      field_type: 'text',
      field_label: 'Current City',
      field_options: [],
      is_required: true,
      field_order: 10
    },
    {
      id: 'default-11',
      field_name: 'academic_status',
      field_type: 'select',
      field_label: 'Academic/Professional Status',
      field_options: ['Undergraduate Student', 'Graduate Student', 'PhD Student', 'Postdoc', 'Faculty/Professor', 'Industry Professional', 'Research Scientist', 'Other'],
      is_required: true,
      field_order: 11
    },
    {
      id: 'default-12',
      field_name: 'experience',
      field_type: 'select',
      field_label: 'Experience',
      field_options: ['Beginner (0-1 years)', 'Intermediate (1-3 years)', 'Advanced (3-5 years)', 'Expert (5+ years)'],
      is_required: true,
      field_order: 12
    },
    {
      id: 'default-13',
      field_name: 'comments',
      field_type: 'textarea',
      field_label: 'Comments',
      field_options: [],
      is_required: false,
      field_order: 13
    },
    {
      id: 'default-14',
      field_name: 'payment_method',
      field_type: 'select',
      field_label: 'Preferred Payment Method',
      field_options: ['UPI', 'PayPal', 'Bkash'],
      is_required: true,
      field_order: 14
    },
    {
      id: 'default-15',
      field_name: 'payment_screenshot',
      field_type: 'file',
      field_label: 'Payment Screenshot',
      field_options: [],
      is_required: true,
      field_order: 15
    }
  ];

  // Fetch form fields for this course
  const { data: customFormFields, isLoading } = useQuery({
    queryKey: ['enrollment-form-fields', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollment_form_fields')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('field_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!courseId
  });

  // Use custom fields if available, otherwise use default fields
  const formFields = customFormFields && customFormFields.length > 0 ? customFormFields : defaultFormFields;

  // Create dynamic form schema based on fields
  const formSchema = formFields ? createFormSchema(formFields) : z.object({});
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to enroll in this course');
      return;
    }

    if (!courseId) {
      toast.error('Course information is missing');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Separate payment screenshot from other form data
      const { payment_screenshot, ...formData } = data;
      
      // Validate required fields
      if (!formData || Object.keys(formData).length === 0) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Submitting enrollment with:', {
        user_id: session.user.id,
        course_id: courseId,
        form_data: formData,
        payment_screenshot_url: payment_screenshot
      });
      
      // Submit enrollment form
      const { error } = await supabase
        .from('enrollment_submissions')
        .insert({
          user_id: session.user.id,
          course_id: courseId,
          form_data: formData,
          payment_screenshot_url: payment_screenshot || null,
          status: 'submitted'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast.success('Enrollment form submitted successfully! We will review and contact you soon.');
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Enrollment submission error:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('Authentication error. Please sign out and sign in again.');
      } else {
        toast.error(error.message || 'Failed to submit enrollment form. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const { field_name, field_type, field_label, field_options, is_required } = field;

    return (
      <FormField
        key={field.id}
        control={form.control}
        name={field_name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              {field_label}
              {is_required && <span className="text-red-500 text-xs">*</span>}
            </FormLabel>
            <FormControl>
              {field_type === 'select' ? (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field_label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(field_options) ? field_options : []).map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field_type === 'textarea' ? (
                <Textarea
                  placeholder={`Enter ${field_label.toLowerCase()}`}
                  {...formField}
                />
              ) : field_type === 'file' ? (
                <FileUpload
                  bucket="documents"
                  path={`enrollment-documents/${session?.user.id}`}
                  onUpload={(url) => formField.onChange(url)}
                  onRemove={() => formField.onChange('')}
                  maxSize={10}
                  accept="image/*,.pdf,.doc,.docx"
                />
              ) : (
                <Input
                  type={field_type}
                  placeholder={`Enter ${field_label.toLowerCase()}`}
                  {...formField}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div>
            <DialogTitle className="text-xl font-bold text-primary">
              Secure your seat
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete the form below to enroll in {course?.title}
            </p>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              {/* Course Fee Display */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-purple-600 mb-4">
                      Course Fee - ${course?.price_offer || course?.price_regular || 50}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">UPI</span>
                        </div>
                        <p className="text-xs text-gray-600">UPI</p>
                        <p className="font-mono text-xs font-medium mt-1">9123999858@xiiB</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">PP</span>
                        </div>
                        <p className="text-xs text-gray-600">PayPal (int.)</p>
                        <p className="font-mono text-xs font-medium mt-1">haifa114@gmail.com</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-2 bg-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">bK</span>
                        </div>
                        <p className="text-xs text-gray-600">Bkash</p>
                        <p className="font-mono text-xs font-medium mt-1">+8801994256422</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Show info if using default fields */}
              {(!customFormFields || customFormFields.length === 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Using standard registration form.</strong> Complete the fields below to enroll in this course.
                  </p>
                </div>
              )}

              {/* Dynamic Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields?.filter(field => field.field_name !== 'payment_method' && field.field_name !== 'payment_screenshot').map((field) => (
                  <div key={field.id} className={field.field_type === 'textarea' || field.field_type === 'comments' ? 'md:col-span-2' : ''}>
                    {renderFormField(field)}
                  </div>
                ))}
              </div>

              {/* Payment Method Section */}
              {formFields?.find(field => field.field_name === 'payment_method') && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    {renderFormField(formFields.find(field => field.field_name === 'payment_method')!)}
                  </div>
                </div>
              )}

              {/* Payment Screenshot Section */}
              {formFields?.find(field => field.field_name === 'payment_screenshot') && (
                <div className="space-y-4">
                  {renderFormField(formFields.find(field => field.field_name === 'payment_screenshot')!)}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};