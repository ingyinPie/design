/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF5ED',
          100: '#FFE8D5',
          200: '#FFCEAD',
          300: '#FFB084',
          400: '#FFA45B',
          500: '#FF8C33',
          600: '#E67A2E',
          700: '#CC6829',
          800: '#B35624',
          900: '#99441F',
        },
        blue: {
          50: '#F0F5FF',
          100: '#E9F0FF',
          200: '#CFDEFF',
          300: '#A6C8FF',
          400: '#7DAEFF',
          500: '#4A6CF7',
          600: '#3D5BD9',
          700: '#304ABB',
          800: '#23399D',
          900: '#16287F',
        },
      },
    },
  },
  plugins: [],
};
