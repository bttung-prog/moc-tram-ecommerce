/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        agarwood: {
          50: '#F6F0E4',
          100: '#EDE2CC',
          200: '#DCC79E',
          300: '#C9A86F',
          400: '#B08D57', // vàng đồng — accent
          500: '#9A7544',
          600: '#7D5E37',
          700: '#5F4829',
          800: '#3B2A14', // nâu trầm đậm — primary
          900: '#2A1D0E',
        },
        moss: {
          50: '#EFF2ED',
          100: '#D8DFD2',
          200: '#A7B69C',
          300: '#7A8C6E',
          400: '#4F5D45', // xanh rêu — secondary
          500: '#3F4A37',
          600: '#323B2C',
          700: '#252D20',
        },
        charcoal: {
          50: '#E8E6E3',
          100: '#C9C5BE',
          200: '#9A958B',
          300: '#6B6660',
          400: '#45413C',
          500: '#2E2A26',
          600: '#1F1A14', // than — dark bg
          700: '#15110D',
        },
        cream: '#F6F0E4',
        ivory: '#FBF8F1',
        success: {
          light: '#E0EBD8',
          DEFAULT: '#4F7A3A',
          dark: '#3A5C2B',
        },
        warning: {
          light: '#F5E6CC',
          DEFAULT: '#B08D57',
          dark: '#8A6E41',
        },
        error: {
          light: '#F0DAD5',
          DEFAULT: '#B5443A',
          dark: '#8F352D',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      maxWidth: {
        'content': '1280px',
        'narrow': '768px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'smoke': 'smokeRise 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        smokeRise: {
          '0%, 100%': { opacity: '0.15', transform: 'translateY(0) scaleX(1)' },
          '50%': { opacity: '0.35', transform: 'translateY(-30px) scaleX(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
