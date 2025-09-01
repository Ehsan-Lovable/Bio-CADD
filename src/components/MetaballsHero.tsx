import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import './MetaballsHero.css';

const CleanHero = () => {
  return (
    <div className="relative">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <h1 className="text-xl font-bold text-white font-pp-neue">BioGenius</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white hover:text-violet-300 transition-colors font-pp-neue">Home</Link>
              <Link to="/courses" className="text-white hover:text-violet-300 transition-colors font-pp-neue">Courses</Link>
              <Link to="/portfolio" className="text-white hover:text-violet-300 transition-colors font-pp-neue">Portfolio</Link>
              <Link to="/contact" className="text-white hover:text-violet-300 transition-colors font-pp-neue">Contact</Link>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white hover:bg-white/10 font-pp-neue">Sign In</Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-pp-neue">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900 text-white overflow-hidden">
        {/* Logo Circles */}
        <div className="absolute top-8 left-8 z-30 flex items-center cursor-pointer">
          <div className="w-6 h-6 bg-white rounded-full mr-2 transition-transform duration-300 hover:-translate-x-2"></div>
          <div className="w-6 h-6 bg-white rounded-full mix-blend-exclusion transition-transform duration-300 hover:translate-x-2"></div>
        </div>

        {/* Center Logo */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
          <h1 className="text-2xl font-light text-white font-pp-neue">BioNexus.</h1>
        </div>

        {/* Hero Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30 max-w-5xl px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] mb-8 text-white font-pp-neue">
            Where data becomes<br/>insight and insight<br/>becomes discovery
          </h1>
          <h2 className="text-sm text-gray-200 uppercase tracking-wider leading-relaxed opacity-80 font-pp-mono">
            advancing bioinformatics research through innovative education<br/>
            empowering scientists with cutting-edge computational tools<br/>
            transforming biological data into meaningful discoveries
          </h2>
        </div>

        {/* Contact Info */}
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-30">
          <p className="text-xs text-gray-300 uppercase tracking-wider mb-2 font-pp-mono">+Get in touch</p>
          <span className="text-sm cursor-pointer hover:text-gray-200 transition-colors text-white font-pp-mono">contact@bionexus.com</span>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-8 left-8 z-30 flex flex-col gap-2">
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:pl-4 relative group font-pp-neue">
            <span className="absolute left-0 top-1/2 w-0 h-px bg-white transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:w-3 group-hover:opacity-100"></span>
            Genomic Analysis
          </a>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:pl-4 relative group font-pp-neue">
            <span className="absolute left-0 top-1/2 w-0 h-px bg-white transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:w-3 group-hover:opacity-100"></span>
            Structural Biology
          </a>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:pl-4 relative group font-pp-neue">
            <span className="absolute left-0 top-1/2 w-0 h-px bg-white transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:w-3 group-hover:opacity-100"></span>
            Machine Learning
          </a>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:pl-4 relative group font-pp-neue">
            <span className="absolute left-0 top-1/2 w-0 h-px bg-white transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:w-3 group-hover:opacity-100"></span>
            Drug Discovery
          </a>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:pl-4 relative group font-pp-neue">
            <span className="absolute left-0 top-1/2 w-0 h-px bg-white transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:w-3 group-hover:opacity-100"></span>
            Contact
          </a>
        </div>

        {/* Coordinates */}
        <div className="absolute bottom-8 right-8 text-right z-30">
          <p className="text-xs text-gray-300 font-pp-mono">BioNexus State • Active</p>
          <p className="text-xs text-gray-400 font-pp-mono">where discovery flows</p>
        </div>

        {/* CTA Buttons */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-pp-neue">
            <Link to="/courses">
              <Star className="mr-3 w-5 h-5" />
              Explore Courses
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/20 hover:border-white/70 px-8 py-4 text-lg rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm font-pp-neue">
            <Link to="/contact">
              <Play className="mr-3 w-5 h-5" />
              Book Consultation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CleanHero;
