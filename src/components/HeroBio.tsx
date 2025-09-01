import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Shield, Award, Users, TrendingUp, Sparkles, Target, CheckCircle } from 'lucide-react';

type Props = {
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string; };
  secondaryCta?: { label: string; href: string; };
  tags?: string[];
};

const HeroBio: React.FC<Props> = ({
  headline = "Master Bioinformatics. Unlock the Future of Genomic Data.",
  subheadline = "Cutting-edge courses and expert consulting to accelerate your research, career, or biotech innovation.",
  primaryCta = { label: "Enroll Now", href: "/courses" },
  secondaryCta = { label: "Book a Consultation", href: "/contact" },
  tags = ["Next-Gen Sequencing", "Machine Learning", "Structural Biology", "Drug Discovery", "Clinical Genomics"]
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Geometric Accents */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-violet-50 rounded-full opacity-60"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-violet-100 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-violet-50 rounded-full opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left Column - Content */}
          <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700`}>
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-violet-50 border border-violet-200 rounded-full text-violet-700 text-sm font-medium">
              <Shield className="w-5 h-5 text-violet-600" />
              Accredited by International Bioinformatics Society
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-gray-900 leading-tight">
              {headline.split('.').map((part, index) => (
                <React.Fragment key={index}>
                  {part.trim()}
                  {index < headline.split('.').length - 1 && (
                    <span className="block text-violet-600 mt-2">
                      {part.trim()}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg" 
                className="group bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                onClick={() => window.location.href = primaryCta.href}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {primaryCta.label}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="group border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 px-8 py-4 text-lg transition-all duration-300"
                onClick={() => window.location.href = secondaryCta.href}
              >
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                {secondaryCta.label}
              </Button>
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-3 pt-8">
              {tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="px-4 py-2 text-sm font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all duration-300"
                >
                  <Target className="w-3 h-3 mr-2 text-violet-600" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-gray-600 text-sm">
                <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
                  <Users className="w-4 h-4 text-violet-600" />
                  <span>500+ Researchers</span>
                </div>
                <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
                  <Award className="w-4 h-4 text-violet-600" />
                  <span>ISO Certified</span>
                </div>
                <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <span>95% Success Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className={`relative h-[500px] sm:h-[600px] lg:h-[700px] ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-700 delay-300`}>
            {/* Modern DNA Visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* Central DNA Structure */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* DNA Backbone */}
                    <path
                      d="M20 20 Q100 40 180 20 Q100 60 20 80 Q100 100 180 120 Q100 140 20 160 Q100 180 180 180"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.8"
                    />
                    <path
                      d="M20 20 Q100 60 180 100 Q100 140 20 180 Q100 160 180 140 Q100 120 20 100 Q100 80 180 60"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.6"
                    />
                    
                    {/* Base Pairs */}
                    <circle cx="100" cy="40" r="3" fill="#8b5cf6" />
                    <circle cx="100" cy="80" r="3" fill="#8b5cf6" />
                    <circle cx="100" cy="120" r="3" fill="#8b5cf6" />
                    <circle cx="100" cy="160" r="3" fill="#8b5cf6" />
                    
                    {/* Connecting Lines */}
                    <line x1="100" y1="40" x2="100" y2="40" stroke="#e9d5ff" strokeWidth="1" opacity="0.5" />
                    <line x1="100" y1="80" x2="100" y2="80" stroke="#e9d5ff" strokeWidth="1" opacity="0.5" />
                    <line x1="100" y1="120" x2="100" y2="120" stroke="#e9d5ff" strokeWidth="1" opacity="0.5" />
                    <line x1="100" y1="160" x2="100" y2="160" stroke="#e9d5ff" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-4 h-4 bg-violet-400 rounded-full opacity-60"></div>
                <div className="absolute top-20 right-16 w-3 h-3 bg-violet-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-20 left-16 w-5 h-5 bg-violet-200 rounded-full opacity-50"></div>
                <div className="absolute bottom-32 right-20 w-3 h-3 bg-violet-300 rounded-full opacity-80"></div>
              </div>
            </div>

            {/* Data Visualization Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-6 bg-violet-400 opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Trusted by 50+ Universities</span>
            </div>
            <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
              <CheckCircle className="w-4 h-4 text-violet-500" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>24/7 Expert Support</span>
            </div>
            <div className="flex items-center gap-2 hover:text-violet-700 transition-colors duration-300">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              <span>Industry Leading Tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-gray-400 hover:text-violet-600 transition-colors duration-300 cursor-pointer group">
        <span className="text-xs font-medium mb-2 tracking-wider uppercase">Scroll to explore</span>
        <div className="w-0.5 h-12 bg-gray-300 group-hover:bg-violet-400 transition-colors duration-300"></div>
        <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 animate-bounce"></div>
      </div>
    </section>
  );
};

export default HeroBio;