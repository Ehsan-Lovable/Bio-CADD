import { useEffect, useState } from 'react';

export function HeroVisualRight() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Respect user's motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);
    
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="relative h-full w-full pointer-events-none overflow-hidden">
      {/* Background Grid */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-20" 
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke="hsl(var(--mustard-500))" 
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--mustard-500))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="200" cy="150" r="150" fill="url(#fade)" />
      </svg>

      {/* DNA Helix */}
      <svg 
        className={`absolute top-12 right-16 w-24 h-32 ${shouldAnimate ? 'animate-helix-rotate' : ''}`}
        viewBox="0 0 60 80"
        style={{ animationDuration: '20s' }}
      >
        <defs>
          <linearGradient id="helix-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--mustard-400))" />
            <stop offset="100%" stopColor="hsl(var(--mustard-600))" />
          </linearGradient>
        </defs>
        <path 
          d="M15 10 Q30 20 15 30 Q0 40 15 50 Q30 60 15 70"
          fill="none"
          stroke="url(#helix-gradient)"
          strokeWidth="2"
          opacity="0.8"
        />
        <path 
          d="M45 10 Q30 20 45 30 Q60 40 45 50 Q30 60 45 70"
          fill="none"
          stroke="url(#helix-gradient)"
          strokeWidth="2"
          opacity="0.6"
        />
        {/* Base pairs */}
        {[15, 25, 35, 45, 55, 65].map((y, i) => (
          <line 
            key={i}
            x1="15" y1={y} x2="45" y2={y}
            stroke="hsl(var(--mustard-500))"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}
      </svg>

      {/* Molecule Cluster */}
      <svg 
        className={`absolute bottom-20 right-8 w-20 h-20 ${shouldAnimate ? 'animate-float' : ''}`}
        viewBox="0 0 60 60"
        style={{ animationDuration: '6s', animationDelay: '1s' }}
      >
        {/* Atoms */}
        <circle cx="20" cy="20" r="4" fill="hsl(var(--mustard-500))" opacity="0.8" />
        <circle cx="40" cy="15" r="3" fill="hsl(var(--mustard-400))" opacity="0.7" />
        <circle cx="30" cy="35" r="3.5" fill="hsl(var(--mustard-600))" opacity="0.9" />
        <circle cx="45" cy="40" r="2.5" fill="hsl(var(--mustard-300))" opacity="0.6" />
        
        {/* Bonds */}
        <line x1="20" y1="20" x2="40" y2="15" stroke="hsl(var(--mustard-500))" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="20" x2="30" y2="35" stroke="hsl(var(--mustard-500))" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="35" x2="45" y2="40" stroke="hsl(var(--mustard-500))" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Protein Ribbon */}
      <svg 
        className={`absolute top-32 right-32 w-16 h-24 ${shouldAnimate ? 'animate-drift' : ''}`}
        viewBox="0 0 40 60"
        style={{ animationDuration: '8s', animationDelay: '0.5s' }}
      >
        <path 
          d="M5 10 Q20 5 35 15 Q25 25 10 20 Q30 35 20 50 Q5 45 15 30"
          fill="none"
          stroke="hsl(var(--mustard-500))"
          strokeWidth="2"
          opacity="0.6"
        />
        <path 
          d="M8 12 Q18 8 32 18 Q22 28 12 23 Q28 38 18 52"
          fill="none"
          stroke="hsl(var(--mustard-400))"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>

      {/* Mass Spec Sparkline */}
      <svg 
        className="absolute bottom-32 right-20 w-28 h-16"
        viewBox="0 0 80 40"
      >
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Peaks */}
        {[
          { x: 10, h: 25 }, { x: 18, h: 15 }, { x: 25, h: 35 }, 
          { x: 35, h: 8 }, { x: 42, h: 28 }, { x: 50, h: 12 },
          { x: 58, h: 32 }, { x: 65, h: 18 }, { x: 72, h: 22 }
        ].map((peak, i) => (
          <rect 
            key={i}
            x={peak.x} 
            y={40 - peak.h} 
            width="1.5" 
            height={peak.h}
            fill="url(#sparkline-gradient)"
          />
        ))}
      </svg>

      {/* Concentric Rings */}
      <svg 
        className="absolute top-1/2 right-12 w-32 h-32 -translate-y-1/2"
        viewBox="0 0 100 100"
      >
        <g opacity="0.3">
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="hsl(var(--mustard-500))" 
            strokeWidth="0.5"
            className={shouldAnimate ? 'animate-pulse' : ''}
            style={{ animationDuration: '4s', animationDelay: '2s' }}
          />
          <circle 
            cx="50" cy="50" r="35" 
            fill="none" 
            stroke="hsl(var(--mustard-400))" 
            strokeWidth="0.5"
            className={shouldAnimate ? 'animate-pulse' : ''}
            style={{ animationDuration: '4s', animationDelay: '2.5s' }}
          />
          <circle 
            cx="50" cy="50" r="25" 
            fill="none" 
            stroke="hsl(var(--mustard-600))" 
            strokeWidth="0.5"
            className={shouldAnimate ? 'animate-pulse' : ''}
            style={{ animationDuration: '4s', animationDelay: '3s' }}
          />
        </g>
      </svg>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-mustard-500 rounded-full opacity-40 ${
              shouldAnimate ? 'animate-drift' : ''
            }`}
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${30 + (i % 3 * 20)}%`,
              animationDuration: `${8 + (i * 2)}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}