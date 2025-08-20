import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react';

export const CareerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume_url: '',
    cover_letter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('career-form', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast.success('Application submitted successfully! We\'ll review your application and get back to you.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        resume_url: '',
        cover_letter: ''
      });
    } catch (error: any) {
      console.error('Career form error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">Join Our Team</h1>
            <p className="text-muted-foreground mb-8">
              We're always looking for talented individuals to join our mission of transforming education through technology.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Remote-First Culture</h3>
                <p className="text-muted-foreground">
                  Work from anywhere while collaborating with a passionate global team.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Collaborative Environment</h3>
                <p className="text-muted-foreground">
                  Join a supportive team that values creativity, innovation, and continuous learning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Professional Growth</h3>
                <p className="text-muted-foreground">
                  Access to courses, conferences, and mentorship opportunities to advance your career.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Competitive Benefits</h3>
                <p className="text-muted-foreground">
                  Comprehensive benefits package including health insurance and flexible time off.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+880 1234 567890"
                />
              </div>

              <div>
                <Label htmlFor="position">Position Applied For *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="e.g., Frontend Developer, Content Creator"
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Summary</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  placeholder="Brief summary of your relevant experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Resume</Label>
                <FileUpload
                  bucket="documents"
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  value={formData.resume_url}
                  onUpload={(url) => handleChange('resume_url', url)}
                  onRemove={() => handleChange('resume_url', '')}
                />
              </div>

              <div>
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea
                  id="cover_letter"
                  value={formData.cover_letter}
                  onChange={(e) => handleChange('cover_letter', e.target.value)}
                  placeholder="Tell us why you'd be a great fit for this role..."
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};