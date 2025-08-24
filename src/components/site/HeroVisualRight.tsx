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
    <div className="relative h-full w-full pointer-events-none overflow-hidden select-none">
      {/* Concentric rings for depth */}
      <div className="absolute -right-8 -top-8 h-80 w-80 rounded-full border border-mustard-500/20" />
      <div className="absolute -right-16 top-10 h-96 w-96 rounded-full border border-mustard-500/10" />

      {/* Dotted grid background */}
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-10">
        <defs>
          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="hsl(var(--mustard-500))" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      {/* Molecule cluster with enhanced visuals */}
      <svg aria-hidden className="relative h-[420px] w-[420px]" viewBox="0 0 600 600">
        <g stroke="hsl(var(--mustard-400))" strokeOpacity="0.6" strokeWidth="2">
          <line x1="160" y1="300" x2="260" y2="220" />
          <line x1="260" y1="220" x2="360" y2="280" />
          <line x1="360" y1="280" x2="440" y2="200" />
          <line x1="260" y1="220" x2="240" y2="120" />
          <line x1="360" y1="280" x2="480" y2="320" />
        </g>
        <g>
          {[
            {x:160, y:300, r:10}, {x:260, y:220, r:12}, {x:360, y:280, r:9},
            {x:440, y:200, r:7}, {x:240, y:120, r:8}, {x:480, y:320, r:11}
          ].map((node, i) => (
            <circle 
              key={i} 
              cx={node.x} 
              cy={node.y} 
              r={node.r} 
              fill="hsl(var(--mustard-500))"
              className={shouldAnimate ? 'animate-float' : ''}
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </g>
      </svg>

      {/* DNA helix with improved styling */}
      <svg 
        aria-hidden 
        className={`absolute right-10 top-6 h-56 w-56 opacity-90 ${shouldAnimate ? 'animate-drift' : ''}`} 
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id="helix" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--mustard-500))" />
            <stop offset="100%" stopColor="hsl(var(--mustard-600))" />
          </linearGradient>
        </defs>
        <g stroke="url(#helix)" strokeWidth="3" fill="none">
          <path d="M30,10 C80,40 120,0 170,30" />
          <path d="M30,40 C80,70 120,30 170,60" />
          <path d="M30,70 C80,100 120,60 170,90" />
          <path d="M30,100 C80,130 120,90 170,120" />
          <path d="M30,130 C80,160 120,120 170,150" />
          <path d="M30,160 C80,190 120,150 170,180" />
          {[
            [30,40,170,30], [30,70,170,60], [30,100,170,90], 
            [30,130,170,120], [30,160,170,150]
          ].map((coords, i) => (
            <line 
              key={i} 
              x1={coords[0]} y1={coords[1]} 
              x2={coords[2]} y2={coords[3]} 
              strokeOpacity="0.6" 
            />
          ))}
        </g>
      </svg>

      {/* Mass spec sparkline with enhanced styling */}
      <svg 
        aria-hidden 
        className="absolute bottom-4 right-2 h-24 w-40 opacity-80" 
        viewBox="0 0 200 100"
      >
        <polyline 
          points="10,90 30,60 40,90 60,50 65,90 90,30 95,90 120,45 130,90 160,40 170,90"
          fill="none" 
          stroke="hsl(var(--mustard-500))" 
          strokeWidth="3" 
        />
      </svg>

      {/* Floating particles for additional depth */}
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

      {/* Add CSS animations for motion preferences */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes float { 
            0%, 100% { transform: translateY(0px) rotate(0deg); } 
            50% { transform: translateY(-8px) rotate(2deg); } 
          }
          .animate-float { 
            animation: float 6s ease-in-out infinite; 
          }
          
          @keyframes drift { 
            0%, 100% { filter: drop-shadow(0 0 0 rgba(255,183,3,0)); } 
            50% { filter: drop-shadow(0 0 8px rgba(255,183,3,0.2)); } 
          }
          .animate-drift { 
            animation: drift 5s ease-in-out infinite; 
          }
        }
      `}</style>
    </div>
  );
}