import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Course Website</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Empowering learners worldwide with high-quality courses and educational resources. 
              Join our community and unlock your potential through expert-led instruction and 
              hands-on learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/career" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Career
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Follow Us
            </h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Course Website. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}