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

  // Dynamic bubble positions and connections
  const bubbles = [
    { id: 1, x: 200, y: 150, size: 80, initialX: 200, initialY: 150 },
    { id: 2, x: 350, y: 200, size: 60, initialX: 350, initialY: 200 },
    { id: 3, x: 120, y: 280, size: 70, initialX: 120, initialY: 280 },
    { id: 4, x: 300, y: 350, size: 55, initialX: 300, initialY: 350 }
  ];

  return (
    <div className="relative h-full w-full pointer-events-none overflow-hidden select-none">
      {/* Ambient glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mustard-500/5 via-transparent to-mustard-600/10" />
      
      {/* Floating gradient orbs for depth */}
      <div className="absolute top-10 right-16 w-32 h-32 bg-gradient-to-br from-mustard-400/20 to-mustard-600/10 rounded-full blur-xl animate-drift" />
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-tr from-mustard-500/15 to-mustard-400/5 rounded-full blur-lg animate-drift" style={{ animationDelay: '2s' }} />

      {/* Main liquid bubbles SVG */}
      <svg aria-hidden className="relative h-full w-full" viewBox="0 0 500 400">
        <defs>
          {/* Liquid bubble gradients */}
          <radialGradient id="bubble1" cx="30%" cy="30%">
            <stop offset="0%" stopColor="hsl(var(--mustard-400))" stopOpacity="0.8" />
            <stop offset="70%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--mustard-600))" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="bubble2" cx="40%" cy="25%">
            <stop offset="0%" stopColor="hsl(var(--mustard-300))" stopOpacity="0.9" />
            <stop offset="60%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--mustard-700))" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="bubble3" cx="35%" cy="40%">
            <stop offset="0%" stopColor="hsl(var(--mustard-400))" stopOpacity="0.85" />
            <stop offset="65%" stopColor="hsl(var(--mustard-600))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--mustard-800))" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="bubble4" cx="45%" cy="30%">
            <stop offset="0%" stopColor="hsl(var(--mustard-300))" stopOpacity="0.8" />
            <stop offset="70%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.65" />
            <stop offset="100%" stopColor="hsl(var(--mustard-700))" stopOpacity="0.35" />
          </radialGradient>

          {/* Dynamic connection line gradient */}
          <linearGradient id="connection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--mustard-400))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--mustard-500))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--mustard-400))" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Dynamic connection lines between bubbles */}
        <g stroke="url(#connection)" strokeWidth="2" fill="none" className={shouldAnimate ? 'animate-pulse-connection' : ''}>
          <path d="M 200 150 Q 275 175 350 200" strokeOpacity="0.7" />
          <path d="M 200 150 Q 160 215 120 280" strokeOpacity="0.5" />
          <path d="M 350 200 Q 325 275 300 350" strokeOpacity="0.6" />
          <path d="M 120 280 Q 210 315 300 350" strokeOpacity="0.4" className={shouldAnimate ? 'animate-connect-disconnect' : ''} />
        </g>

        {/* Liquid bubble shapes */}
        {bubbles.map((bubble, index) => (
          <g key={bubble.id}>
            {/* Main bubble with organic liquid shape */}
            <path
              d={`M ${bubble.x - bubble.size/2} ${bubble.y} 
                  C ${bubble.x - bubble.size*0.7} ${bubble.y - bubble.size*0.4},
                    ${bubble.x - bubble.size*0.4} ${bubble.y - bubble.size*0.7},
                    ${bubble.x} ${bubble.y - bubble.size/2}
                  C ${bubble.x + bubble.size*0.4} ${bubble.y - bubble.size*0.7},
                    ${bubble.x + bubble.size*0.7} ${bubble.y - bubble.size*0.4},
                    ${bubble.x + bubble.size/2} ${bubble.y}
                  C ${bubble.x + bubble.size*0.7} ${bubble.y + bubble.size*0.4},
                    ${bubble.x + bubble.size*0.4} ${bubble.y + bubble.size*0.7},
                    ${bubble.x} ${bubble.y + bubble.size/2}
                  C ${bubble.x - bubble.size*0.4} ${bubble.y + bubble.size*0.7},
                    ${bubble.x - bubble.size*0.7} ${bubble.y + bubble.size*0.4},
                    ${bubble.x - bubble.size/2} ${bubble.y} Z`}
              fill={`url(#bubble${index + 1})`}
              className={shouldAnimate ? 'animate-liquid-float' : ''}
              style={{ 
                animationDelay: `${index * 0.8}s`,
                animationDuration: `${6 + index}s`
              }}
            />
            
            {/* Inner highlight for 3D effect */}
            <ellipse
              cx={bubble.x - bubble.size * 0.2}
              cy={bubble.y - bubble.size * 0.2}
              rx={bubble.size * 0.15}
              ry={bubble.size * 0.1}
              fill="hsl(var(--mustard-200))"
              opacity="0.6"
              className={shouldAnimate ? 'animate-liquid-float' : ''}
              style={{ 
                animationDelay: `${index * 0.8}s`,
                animationDuration: `${6 + index}s`
              }}
            />
          </g>
        ))}

        {/* Micro bubbles for extra detail */}
        {[...Array(8)].map((_, i) => (
          <circle
            key={`micro-${i}`}
            cx={50 + (i * 45)}
            cy={80 + (i % 3 * 40)}
            r={2 + (i % 3)}
            fill="hsl(var(--mustard-400))"
            opacity="0.4"
            className={shouldAnimate ? 'animate-micro-float' : ''}
            style={{ 
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 3)}s`
            }}
          />
        ))}
      </svg>

      {/* CSS animations for liquid effects */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes liquid-float { 
            0%, 100% { 
              transform: translate(0px, 0px) scale(1) rotate(0deg); 
            } 
            25% { 
              transform: translate(-8px, -12px) scale(1.05) rotate(1deg); 
            }
            50% { 
              transform: translate(6px, -8px) scale(0.98) rotate(-1deg); 
            }
            75% { 
              transform: translate(-4px, 10px) scale(1.02) rotate(0.5deg); 
            }
          }
          .animate-liquid-float { 
            animation: liquid-float 8s ease-in-out infinite; 
            transform-origin: center center;
          }
          
          @keyframes micro-float { 
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; } 
            50% { transform: translateY(-15px) scale(1.2); opacity: 0.7; } 
          }
          .animate-micro-float { 
            animation: micro-float 5s ease-in-out infinite; 
          }
          
          @keyframes drift { 
            0%, 100% { 
              transform: translate(0px, 0px) scale(1);
              filter: blur(12px);
            } 
            50% { 
              transform: translate(20px, -15px) scale(1.1);
              filter: blur(8px);
            } 
          }
          .animate-drift { 
            animation: drift 12s ease-in-out infinite; 
          }

          @keyframes pulse-connection {
            0%, 100% { stroke-opacity: 0.3; }
            50% { stroke-opacity: 0.8; }
          }
          .animate-pulse-connection {
            animation: pulse-connection 4s ease-in-out infinite;
          }

          @keyframes connect-disconnect {
            0%, 100% { stroke-opacity: 0; }
            25%, 75% { stroke-opacity: 0.6; }
            50% { stroke-opacity: 0; }
          }
          .animate-connect-disconnect {
            animation: connect-disconnect 8s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}