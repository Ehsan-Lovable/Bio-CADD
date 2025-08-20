import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, CreditCard, Shield, AlertTriangle, Scale } from 'lucide-react';

const Terms = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground mt-2">
              Please read these terms carefully before using our platform.
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using our educational platform, you accept and agree to be bound by 
                  these Terms of Service. If you do not agree to these terms, please do not use our 
                  services. These terms apply to all users, including students, instructors, and visitors.
                </p>
              </CardContent>
            </Card>

            {/* Platform Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Platform Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our platform provides online educational services including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Access to online courses and educational content</li>
                  <li>Progress tracking and learning analytics</li>
                  <li>Community features and discussions</li>
                  <li>Certificates upon course completion</li>
                  <li>Customer support and assistance</li>
                </ul>
                <p className="text-muted-foreground">
                  We reserve the right to modify, suspend, or discontinue any part of our services 
                  at any time with reasonable notice.
                </p>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  As a user of our platform, you agree to:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Account Management</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Provide accurate registration information</li>
                      <li>Maintain account security</li>
                      <li>Keep login credentials confidential</li>
                      <li>Notify us of unauthorized access</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Acceptable Use</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Use services for educational purposes</li>
                      <li>Respect other users and instructors</li>
                      <li>Follow community guidelines</li>
                      <li>Report inappropriate behavior</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Prohibited Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The following activities are strictly prohibited:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Sharing account credentials or unauthorized access</li>
                  <li>Downloading, copying, or redistributing course content</li>
                  <li>Reverse engineering or attempting to extract source code</li>
                  <li>Using automated tools to access or scrape content</li>
                  <li>Posting spam, malicious content, or inappropriate material</li>
                  <li>Violating intellectual property rights</li>
                  <li>Attempting to disrupt or harm the platform</li>
                  <li>Using services for illegal or fraudulent activities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Course Purchases</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All course prices are clearly displayed before purchase</li>
                    <li>Payments are processed securely through trusted providers</li>
                    <li>Course access begins immediately after successful payment</li>
                    <li>No automatic recurring charges unless explicitly stated</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Refund Policy</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>30-day money-back guarantee for course purchases</li>
                    <li>Refunds processed within 5-7 business days</li>
                    <li>No refunds for completed courses or certificate fees</li>
                    <li>Contact support for refund requests</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Our Content</h4>
                  <p className="text-muted-foreground">
                    All course materials, videos, text, images, and other content on our platform 
                    are protected by intellectual property laws. You may access and use this content 
                    for personal, non-commercial educational purposes only.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your Content</h4>
                  <p className="text-muted-foreground">
                    Any content you submit (comments, questions, feedback) remains your property, 
                    but you grant us a license to use, modify, and display it as necessary to 
                    provide our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Our collection, use, and protection of your 
                  personal information is governed by our Privacy Policy. By using our services, 
                  you consent to the data practices described in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Disclaimers & Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Availability</h4>
                  <p className="text-muted-foreground">
                    While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                    Maintenance, updates, or technical issues may temporarily affect availability.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Educational Outcomes</h4>
                  <p className="text-muted-foreground">
                    We provide high-quality educational content, but cannot guarantee specific 
                    learning outcomes, job placement, or career advancement. Success depends on 
                    individual effort and circumstances.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                  <p className="text-muted-foreground">
                    Our liability is limited to the amount you paid for the specific course or 
                    service. We are not liable for indirect, incidental, or consequential damages.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Account Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Your Right to Terminate</h4>
                  <p className="text-muted-foreground">
                    You may close your account at any time by contacting our support team. 
                    Upon termination, you'll lose access to all courses and materials.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Our Right to Terminate</h4>
                  <p className="text-muted-foreground">
                    We may suspend or terminate accounts that violate these terms, engage in 
                    prohibited activities, or for any reason with reasonable notice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update these Terms of Service from time to time. We'll notify you of 
                  significant changes via email or through a prominent notice on our platform. 
                  Continued use of our services after changes indicates acceptance of the updated terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@coursewebsite.com</p>
                  <p><strong>Address:</strong> 123 Education Street, Learning City, 12345</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Terms;