/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Light Theme Backgrounds (replaces navy) */
        navy: {
          950: '#F3F4F6',
          900: '#FAFAFA',
          800: '#FFFFFF',
          700: '#F3F4F6',
          600: '#E5E7EB',
          500: '#D1D5DB',
        },
        /* Raw Sienna (Primary) */
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
        /* Xanadu (Accent) */
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
        /* Dark Grays for Text (replaces gainsboro) */
        gainsboro: {
          50:  '#000000',
          100: '#111827',
          200: '#1F2937',
          300: '#374151',
          400: '#4B5563',
          500: '#6B7280',
          600: '#9CA3AF',
          700: '#D1D5DB',
          800: '#E5E7EB',
          900: '#F3F4F6',
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
