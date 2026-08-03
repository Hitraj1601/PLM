/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Clean Light Theme Backgrounds */
        navy: {
          950: '#F8FAFC',
          900: '#FFFFFF',
          800: '#FFFFFF',
          700: '#F1F5F9',
          600: '#E2E8F0',
          500: '#CBD5E1',
        },
        /* Raw Sienna (Primary Accent) */
        sienna: {
          50:  '#FFF8F0',
          100: '#FFECD4',
          200: '#FFD5A3',
          300: '#FFBA6E',
          400: '#E89545',
          500: '#C87533',
          600: '#A85E28',
          700: '#88491E',
          800: '#683615',
          900: '#48240E',
        },
        /* Xanadu (Secondary Accent) */
        xanadu: {
          50:  '#F2F5F3',
          100: '#E0E8E3',
          200: '#C5D3C9',
          300: '#A3B8A9',
          400: '#8FA898',
          500: '#738678',
          600: '#5C6D60',
          700: '#4A574D',
          800: '#3B453D',
          900: '#2D352F',
        },
        /* Ultra High Contrast Dark Text for Light Theme */
        gainsboro: {
          50:  '#0F172A',
          100: '#0F172A',
          200: '#1E293B',
          300: '#334155',
          400: '#475569',
          500: '#64748B',
          600: '#94A3B8',
          700: '#CBD5E1',
          800: '#E2E8F0',
          900: '#F1F5F9',
          950: '#F8FAFC',
        },
      },
      /* Override Tailwind's default indigo → Raw Sienna */
      /* Override Tailwind's default teal → Xanadu */
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
