import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, Cookie, Mail } from 'lucide-react';

const Privacy = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground mt-2">
              We respect your privacy and are committed to protecting your personal data.
            </p>
          </div>

          <div className="space-y-8">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Name and email address when you create an account</li>
                    <li>Profile information you choose to provide</li>
                    <li>Payment information for course purchases</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usage Information</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Course progress and completion data</li>
                    <li>Learning analytics and study patterns</li>
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide and improve our educational services</li>
                  <li>Track your learning progress and provide personalized recommendations</li>
                  <li>Process payments and manage your account</li>
                  <li>Send important updates about courses and platform changes</li>
                  <li>Respond to your questions and provide customer support</li>
                  <li>Analyze platform usage to improve user experience</li>
                  <li>Comply with legal obligations and protect against fraud</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure cloud storage with regular backups</li>
                  <li>Access controls and authentication systems</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Data minimization - we only collect what's necessary</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  Cookies & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Essential Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Required for basic platform functionality, including authentication and security.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our platform to improve your experience.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can manage cookie preferences through your browser settings.
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Data Sharing & Third Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share data only in these circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>With your explicit consent</li>
                  <li>To provide services you've requested (e.g., payment processing)</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>In case of business transfer or merger</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your data (subject to legal requirements)</li>
                    <li>Restrict data processing</li>
                  </ul>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Data portability</li>
                    <li>Object to data processing</li>
                    <li>Withdraw consent</li>
                    <li>File complaints with authorities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or want to exercise your rights, contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@coursewebsite.com</p>
                  <p><strong>Address:</strong> 123 Education Street, Learning City, 12345</p>
                  <p><strong>Response Time:</strong> We'll respond within 30 days</p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We'll notify you of significant 
                  changes via email or through a prominent notice on our platform. Your continued use 
                  of our services after any changes indicates your acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Privacy;