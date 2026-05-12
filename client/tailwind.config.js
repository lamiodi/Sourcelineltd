/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6806',
        'primary-light': '#FF8C38',
        'primary-dark': '#D95300',
        secondary: '#000440',
        'secondary-light': '#0A0F5C',
        tertiary: '#F4F4F4',
        background: '#FFFFFF',
        'primary-hover': '#e55a00',
        'secondary-hover': '#000330',
        surface: '#F8F9FF',
        accent: '#FFB347',
        'warm-gray': {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        heading: ['"Playfair Display"', 'serif'],
        'display-alt': ['"Julius Sans One"', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 20px 60px 0 rgba(0, 4, 64, 0.12)',
        'primary-glow': '0 8px 30px rgba(255, 104, 6, 0.35)',
        'primary-glow-lg': '0 16px 50px rgba(255, 104, 6, 0.45)',
        'card': '0 4px 20px rgba(0, 4, 64, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 4, 64, 0.15)',
        'elevated': '0 24px 80px rgba(0, 4, 64, 0.12)',
        'inner-glow': 'inset 0 2px 20px rgba(255, 104, 6, 0.08)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-overlay': 'linear-gradient(165deg, rgba(0,4,64,0.7) 0%, rgba(0,4,64,0.3) 50%, rgba(0,4,64,0.7) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #FF6806 0%, #FFB347 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #000440 0%, #0A0F5C 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(255, 104, 6, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 4, 64, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(255, 179, 71, 0.06) 0px, transparent 50%)',
        'dot-pattern': 'radial-gradient(circle, rgba(0,4,64,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 104, 6, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255, 104, 6, 0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'text-reveal': {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.6s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        'text-reveal': 'text-reveal 0.8s ease-out forwards',
        'slide-in-bottom': 'slide-in-bottom 0.5s ease-out forwards',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
}
