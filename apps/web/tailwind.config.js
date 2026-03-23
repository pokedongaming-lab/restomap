/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bloomberg Terminal Theme
        terminal: {
          bg: '#030303',
          bg2: '#0a0a0a',
          bg3: '#111111',
          panel: '#0d0d0d',
        },
        brand: {
          50:  '#eef2ff',
          500: '#FF6D00',
          600: '#FF8F00',
          700: '#FFA726',
        },
        accent: {
          DEFAULT: '#FF6D00',
          hover: '#FF8F00',
          light: 'rgba(255, 109, 0, 0.1)',
        },
        lime: {
          DEFAULT: '#c9f03a',
          dark: '#8ecc20',
          light: 'rgba(201, 240, 58, 0.1)',
        },
        profit: '#69F0AE',
        loss: '#FF5252',
        info: '#4DA6FF',
        warning: '#FFA726',
      },
      fontFamily: {
        mono: ['Share Tech Mono', 'monospace'],
        display: ['DM Serif Display', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
