import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Star, Play, Users, TrendingUp, Check, ChevronDown } from 'lucide-react';
import Bioinformatics3D from './Bioinformatics3D';

const Hero = () => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-white via-violet-50/30 to-blue-50/30 overflow-hidden">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-transparent to-blue-100/20"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-violet-100/80 backdrop-blur-sm text-violet-700 rounded-full text-sm font-semibold border border-violet-200/50 shadow-sm">
              <Shield className="w-5 h-5" />
              Accredited by International Bioinformatics Society
            </div>
            
            {/* Main Headline with better typography */}
            <div className="space-y-4">
              <h1 className="font-heading font-bold text-6xl lg:text-7xl xl:text-8xl leading-tight">
                <span className="text-gray-900">Leading</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600">
                  Bioinformatics
                </span>
                <br />
                <span className="text-gray-900">& CADD</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                  Service
                </span>
              </h1>
            </div>
            
            {/* Description with better styling */}
            <div className="max-w-2xl lg:max-w-none">
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                Cutting-edge courses and expert consulting to accelerate your research, career, or biotech innovation.
              </p>
            </div>
            
            {/* CTA Buttons with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-5 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/courses">
                  <Star className="mr-3 w-6 h-6" />
                  Enroll Now →
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400 px-10 py-5 text-lg rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <Link to="/portfolio">
                  <Play className="mr-3 w-6 h-6" />
                  Book a Consultation
                </Link>
              </Button>
            </div>
            
            {/* Topic Tags with better layout */}
            <div className="pt-8">
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  "Next-Gen Sequencing",
                  "Machine Learning", 
                  "Structural Biology",
                  "Drug Discovery",
                  "Clinical Genomics"
                ].map((tag, index) => (
                  <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-violet-200/50 text-violet-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side - 3D Graphics and Scroll Indicator */}
          <div className="relative flex flex-col items-center lg:items-end">
            <div className="mb-8">
              <Bioinformatics3D />
            </div>
            
            {/* Enhanced Scroll Indicator */}
            <div className="flex items-center gap-4 text-violet-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-violet-200/50 shadow-sm">
              <div className="w-px h-6 bg-violet-400"></div>
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">SCROLL TO EXPLORE</span>
            </div>
          </div>
        </div>
        
        {/* Bottom section with statistics and trust indicators */}
        <div className="mt-20 grid lg:grid-cols-2 gap-16">
          {/* Key Statistics/Features with enhanced styling */}
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-bold text-gray-900 text-center lg:text-left mb-8">Why Choose Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
              <div className="text-center lg:text-left p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Researchers</div>
              </div>
              <div className="text-center lg:text-left p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">ISO</div>
                <div className="text-sm text-gray-600">Certified</div>
              </div>
              <div className="text-center lg:text-left p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators with enhanced styling */}
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-bold text-gray-900 text-center lg:text-left mb-8">Trust & Quality</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm font-medium">Trusted by 50+ Universities</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm font-medium">ISO 27001 Certified</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm font-medium">24/7 Expert Support</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-violet-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm font-medium">Industry Leading Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
