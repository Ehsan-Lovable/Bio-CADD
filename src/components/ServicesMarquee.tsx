import { 
  Atom, 
  Beaker, 
  TrendingUp, 
  Target, 
  Brain, 
  Dna, 
  Network, 
  TestTube 
} from 'lucide-react';

interface ServiceItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICES: ServiceItem[] = [
  { name: 'Molecular Docking', icon: Atom },
  { name: 'MD Simulation', icon: Beaker },
  { name: 'Protein Modelling', icon: Target },
  { name: 'DFT Analysis', icon: TrendingUp },
  { name: 'QSAR', icon: Brain },
  { name: 'NGS', icon: Dna },
  { name: 'Network Pharmacology', icon: Network },
  { name: 'ADMET', icon: TestTube },
];

export function ServicesMarquee() {
  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set of services */}
          {SERVICES.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={`first-${index}`} className="flex items-center gap-3 mx-8 text-primary">
                <IconComponent className="w-5 h-5" />
                <span className="text-lg font-medium">{service.name}</span>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            );
          })}
          
          {/* Second set of services for seamless loop */}
          {SERVICES.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={`second-${index}`} className="flex items-center gap-3 mx-8 text-primary">
                <IconComponent className="w-5 h-5" />
                <span className="text-lg font-medium">{service.name}</span>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
