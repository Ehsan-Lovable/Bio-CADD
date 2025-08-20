import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tags?: string[];
};

const HeroBio: React.FC<Props> = ({
  headline = "Data-driven Bioinformatics & Computational Discovery",
  subheadline = "Transform genomics, proteomics, and molecular data into actionable insights through cutting-edge computational biology and chemistry solutions.",
  primaryCta = { label: "Explore Services", href: "#services" },
  secondaryCta = { label: "Get Consultation", href: "#contact" },
  tags = [
    "Genomics (WGS/RNA-seq)",
    "Proteomics (DIA/DDA)",
    "Docking & Virtual Screening",
    "QSAR/ADMET",
    "ML for Omics"
  ]
}) => {
  return (
    <section className="relative min-h-screen bg-true-black overflow-hidden">
      {/* Custom CSS for backgrounds and reduced motion */}
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .animate-float,
            .animate-drift,
            .animate-helix-rotate {
              animation: none !important;
            }
          }
          
          .dotted-grid {
            background-image: radial-gradient(circle, hsl(var(--mustard-500) / 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
          }
          
          .mustard-glow {
            background: radial-gradient(ellipse at center, hsl(var(--mustard-500) / 0.1) 0%, transparent 70%);
          }
        `}
      </style>
      
      {/* Background Effects */}
      <div className="absolute inset-0 dotted-grid" />
      <div className="absolute inset-0 mustard-glow" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            <Badge variant="outline" className="border-mustard-500/30 text-mustard-500 bg-mustard-500/5">
              Bioinformatics • Computational Biology & Chemistry
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold font-heading tracking-tight text-near-white leading-tight">
              Data-driven{' '}
              <span className="text-mustard-500">Bioinformatics</span>
              {' '}& Computational Discovery
            </h1>
            
            <p className="text-xl text-near-white/80 leading-relaxed max-w-2xl">
              {subheadline}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-mustard-500 hover:bg-mustard-600 text-true-black font-semibold"
                onClick={() => document.querySelector(primaryCta.href)?.scrollIntoView({ behavior: 'smooth' })}
              >
                {primaryCta.label}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-mustard-500/50 text-mustard-500 hover:bg-mustard-500/10"
                onClick={() => document.querySelector(secondaryCta.href)?.scrollIntoView({ behavior: 'smooth' })}
              >
                {secondaryCta.label}
              </Button>
            </div>
            
            {/* Service Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-near-white/10 text-near-white/90 border-0 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Right Column - Visuals */}
          <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center">
            
            {/* Background Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full border border-mustard-500/10" />
              <div className="absolute w-96 h-96 rounded-full border border-mustard-500/5" />
            </div>
            
            {/* Molecule Cluster */}
            <div className="absolute top-20 right-20 animate-float">
              <svg width="120" height="80" viewBox="0 0 120 80" className="drop-shadow-lg">
                {/* Atoms */}
                <circle cx="20" cy="20" r="8" fill="hsl(var(--mustard-500))" opacity="0.9" />
                <circle cx="60" cy="15" r="6" fill="hsl(var(--mustard-400))" opacity="0.8" />
                <circle cx="100" cy="25" r="7" fill="hsl(var(--mustard-600))" opacity="0.9" />
                <circle cx="40" cy="50" r="5" fill="hsl(var(--mustard-300))" opacity="0.7" />
                <circle cx="80" cy="55" r="6" fill="hsl(var(--mustard-500))" opacity="0.8" />
                
                {/* Bonds */}
                <line x1="28" y1="20" x2="52" y2="15" stroke="hsl(var(--mustard-500))" strokeWidth="2" opacity="0.6" />
                <line x1="66" y1="15" x2="93" y2="25" stroke="hsl(var(--mustard-500))" strokeWidth="2" opacity="0.6" />
                <line x1="45" y1="50" x2="74" y2="55" stroke="hsl(var(--mustard-500))" strokeWidth="2" opacity="0.6" />
                <line x1="25" y1="28" x2="35" y2="45" stroke="hsl(var(--mustard-500))" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
            
            {/* DNA Helix */}
            <div className="absolute bottom-20 left-10 animate-helix-rotate">
              <svg width="60" height="200" viewBox="0 0 60 200" className="drop-shadow-lg">
                {/* Left Strand */}
                <path 
                  d="M15 10 Q30 50 15 90 Q0 130 15 170 Q30 190 15 200" 
                  stroke="hsl(var(--mustard-500))" 
                  strokeWidth="3" 
                  fill="none" 
                  opacity="0.8"
                />
                {/* Right Strand */}
                <path 
                  d="M45 10 Q30 50 45 90 Q60 130 45 170 Q30 190 45 200" 
                  stroke="hsl(var(--mustard-400))" 
                  strokeWidth="3" 
                  fill="none" 
                  opacity="0.8"
                />
                {/* Rungs */}
                <line x1="15" y1="30" x2="45" y2="30" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="20" y1="50" x2="40" y2="50" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="15" y1="70" x2="45" y2="70" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="20" y1="90" x2="40" y2="90" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="15" y1="110" x2="45" y2="110" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="20" y1="130" x2="40" y2="130" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="15" y1="150" x2="45" y2="150" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
                <line x1="20" y1="170" x2="40" y2="170" stroke="hsl(var(--mustard-600))" strokeWidth="2" opacity="0.5" />
              </svg>
            </div>
            
            {/* Protein Ribbon */}
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2 animate-drift">
              <svg width="200" height="100" viewBox="0 0 200 100" className="drop-shadow-lg">
                <path 
                  d="M20 50 Q60 20 100 50 Q140 80 180 50" 
                  stroke="hsl(var(--mustard-500))" 
                  strokeWidth="4" 
                  fill="none" 
                  opacity="0.7"
                  strokeLinecap="round"
                />
                <path 
                  d="M20 55 Q60 25 100 55 Q140 85 180 55" 
                  stroke="hsl(var(--mustard-400))" 
                  strokeWidth="2" 
                  fill="none" 
                  opacity="0.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBio;