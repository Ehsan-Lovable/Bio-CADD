import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'heading': ['PP Neue Montreal', 'Inter', 'system-ui', 'sans-serif'],
				'body': ['PP Neue Montreal', 'Inter', 'system-ui', 'sans-serif'],
				'sans': ['PP Neue Montreal', 'Inter', 'system-ui', 'sans-serif'],
				'mono': ['PPSupplyMono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
				'pp-neue': ['PP Neue Montreal', 'sans-serif'],
				'pp-mono': ['PPSupplyMono', 'monospace'],
			},
			letterSpacing: {
				'tight': '-0.025em',
			},
			colors: {
				/* Mustard palette */
				mustard: {
					50: 'hsl(var(--mustard-50))',
					100: 'hsl(var(--mustard-100))',
					200: 'hsl(var(--mustard-200))',
					300: 'hsl(var(--mustard-300))',
					400: 'hsl(var(--mustard-400))',
					500: 'hsl(var(--mustard-500))',
					600: 'hsl(var(--mustard-600))',
					700: 'hsl(var(--mustard-700))',
					800: 'hsl(var(--mustard-800))',
					900: 'hsl(var(--mustard-900))',
				},
				/* Core blacks */
				'true-black': 'hsl(var(--true-black))',
				'off-black': 'hsl(var(--off-black))',
				'near-white': 'hsl(var(--near-white))',
				'cream': 'hsl(var(--cream))',
				/* Accent colors */
				success: 'hsl(var(--success))',
				danger: 'hsl(var(--danger))',
				info: 'hsl(var(--info))',
				/* Semantic tokens */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'mustard': 'var(--shadow-mustard)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(2deg)' }
				},
				'drift': {
					'0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
					'25%': { transform: 'translateX(5px) translateY(-3px)' },
					'50%': { transform: 'translateX(-3px) translateY(-5px)' },
					'75%': { transform: 'translateX(-5px) translateY(3px)' }
				},
				'helix-rotate': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'drift': 'drift 8s ease-in-out infinite',
				'helix-rotate': 'helix-rotate 20s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
