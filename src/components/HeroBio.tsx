import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroVisualRight } from '@/components/site/HeroVisualRight';
type Props = {
  headline?: string;
  subheadline?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  tags?: string[];
};
const HeroBio: React.FC<Props> = ({
  headline = "Data-driven Bioinformatics & Computational Discovery",
  subheadline = "Transform genomics, proteomics, and molecular data into actionable insights through cutting-edge computational biology and chemistry solutions.",
  primaryCta = {
    label: "Explore Services",
    href: "#services"
  },
  secondaryCta = {
    label: "Get Consultation",
    href: "#contact"
  },
  tags = ["Genomics (WGS/RNA-seq)", "Proteomics (DIA/DDA)", "Docking & Virtual Screening", "QSAR/ADMET", "ML for Omics"]
}) => {
  return <section className="relative min-h-screen bg-true-black overflow-hidden">
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
            <Badge variant="outline" className="border-mustard-500/30 text-mustard-500 bg-mustard-500/5">Bioinformatics • CADD
 
• 
Computational Biology & Chemistry</Badge>
            
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
              <Button size="lg" className="bg-mustard-500 hover:bg-mustard-600 text-true-black font-semibold" onClick={() => document.querySelector(primaryCta.href)?.scrollIntoView({
              behavior: 'smooth'
            })}>
                {primaryCta.label}
              </Button>
              <Button variant="outline" size="lg" className="border-mustard-500/50 text-mustard-500 hover:bg-mustard-500/10" onClick={() => document.querySelector(secondaryCta.href)?.scrollIntoView({
              behavior: 'smooth'
            })}>
                {secondaryCta.label}
              </Button>
            </div>
            
            {/* Service Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag, index) => <Badge key={index} variant="secondary" className="bg-near-white/10 text-near-white/90 border-0 text-xs">
                  {tag}
                </Badge>)}
            </div>
          </div>
          
          {/* Right Column - Visuals */}
          <div className="relative h-[500px] lg:h-[600px]">
            <HeroVisualRight />
          </div>
        </div>
      </div>
    </section>;
};
export default HeroBio;