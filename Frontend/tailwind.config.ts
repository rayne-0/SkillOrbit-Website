import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — keep original
        primary: {
          DEFAULT: '#0056D2',
          50:  '#E8F0FE',
          100: '#C6D8FC',
          200: '#93B5FA',
          300: '#5F91F8',
          400: '#2B6DF5',
          500: '#0056D2',
          600: '#0044A8',
          700: '#003380',
          800: '#002258',
          900: '#001130',
        },
        accent: {
          DEFAULT: '#00BFA5',
          50:  '#E0F9F6',
          100: '#B3F0E9',
          200: '#66E1D3',
          300: '#1AD2BE',
          400: '#00BFA5',
          500: '#009E89',
          600: '#007D6C',
          700: '#005C50',
          800: '#003B34',
          900: '#001A18',
        },
        // Surfaces
        surface: {
          DEFAULT: '#0A0E1A',
          50: '#F8F9FC',
          100: '#EEF1F8',
          200: '#D6DCEF',
          300: '#B0BCDF',
          400: '#8596CC',
          500: '#5C70B5',
          600: '#3A519A',
          700: '#23367A',
          800: '#111E4E',
          900: '#0A0E1A',
          950: '#060812',
        },
        // Status
        danger:  { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#991B1B' },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E' },
        info:    { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1E3A8A' },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 86, 210, 0.35)',
        'glow-accent':  '0 0 20px rgba(0, 191, 165, 0.35)',
        'glow-sm':      '0 0 10px rgba(0, 86, 210, 0.25)',
        'inner-glow':   'inset 0 0 20px rgba(0, 86, 210, 0.1)',
        'card':         '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        'card-hover':   '0 4px 20px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.10)',
        'glass':        '0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'gradient-radial':      'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':       'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-primary':         'radial-gradient(at 40% 20%, rgba(0,86,210,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,191,165,0.10) 0px, transparent 50%)',
        'mesh-dark':            'radial-gradient(at 30% 20%, rgba(0,86,210,0.20) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(0,191,165,0.15) 0px, transparent 50%)',
        'hero-dark':            'linear-gradient(135deg, #060812 0%, #0A1628 50%, #060E20 100%)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 1.5s linear infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-slow':  'bounce 3s infinite',
        'orbit':        'orbit 12s linear infinite',
        'counter':      'counter 0.8s ease-out forwards',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'fade-in':      'fadeIn 0.3s ease-out',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,86,210,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(0,86,210,0.6)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth':    'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
