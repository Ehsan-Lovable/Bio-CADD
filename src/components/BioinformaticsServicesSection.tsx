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
import { Link } from 'react-router-dom';

interface ServiceItem {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const SERVICES: ServiceItem[] = [
  {
    name: 'Molecular Docking',
    description: 'Advanced molecular docking simulations for drug discovery and protein-ligand interactions',
    icon: Atom,
    category: 'Drug Discovery'
  },
  {
    name: 'MD Simulation',
    description: 'Molecular dynamics simulations for studying protein dynamics and conformational changes',
    icon: Beaker,
    category: 'Molecular Dynamics'
  },
  {
    name: 'Protein Modelling',
    description: '3D protein structure prediction and homology modeling',
    icon: Target,
    category: 'Structure Prediction'
  },
  {
    name: 'DFT Analysis',
    description: 'Density Functional Theory analysis for electronic structure calculations',
    icon: TrendingUp,
    category: 'Quantum Chemistry'
  },
  {
    name: 'QSAR',
    description: 'Quantitative Structure-Activity Relationship modeling for drug design',
    icon: Brain,
    category: 'Drug Design'
  },
  {
    name: 'NGS',
    description: 'Next Generation Sequencing data analysis and bioinformatics',
    icon: Dna,
    category: 'Genomics'
  },
  {
    name: 'Network Pharmacology',
    description: 'Systems biology approach for understanding drug-target interactions',
    icon: Network,
    category: 'Systems Biology'
  },
  {
    name: 'ADMET',
    description: 'Absorption, Distribution, Metabolism, Excretion, and Toxicity prediction',
    icon: TestTube,
    category: 'Drug Safety'
  }
];

export function BioinformaticsServicesSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bioinformatics & <span className="text-primary">CADD Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cutting-edge computational approaches for drug discovery, molecular modeling, and bioinformatics analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            
            return (
              <div 
                key={service.name} 
                className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {service.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {service.description}
                </p>
                
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {service.category}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to accelerate your research with our expertise?
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
