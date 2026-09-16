/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F8CFF',
          light: '#EAF2FF',
        },
        bg: {
          DEFAULT: '#F7FAFF',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#141B2B',
        },
        ink: {
          DEFAULT: '#172033',
          dark: '#E7ECF5',
        },
        muted: {
          DEFAULT: '#667085',
          dark: '#8B96AC',
        },
        border: {
          DEFAULT: '#E4EAF2',
          dark: '#232D42',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '11px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 32, 51, 0.04), 0 4px 16px rgba(23, 32, 51, 0.04)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.97)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'scale-in': 'scale-in 0.18s ease-out both',
      },
    },
  },
  plugins: [],
};
