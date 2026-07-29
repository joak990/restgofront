/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Crema — fondos cálidos, superficies, separadores
        cream: {
          50: '#fdfaf2',
          100: '#f8f0db',
          200: '#f0e3bf',
          300: '#e7d29b',
          400: '#d4b572',
          500: '#c19c5a',
          600: '#9d7e44',
          700: '#7a6235',
          800: '#574828',
          900: '#382f1a',
        },
        // Forest — verde oscuro, acentos primarios, botones
        forest: {
          50: '#eef5ee',
          100: '#d4e3d4',
          200: '#a9c7a9',
          300: '#7baa7b',
          400: '#5a8c5a',
          500: '#3d6f3d',
          600: '#2d5a2d',
          700: '#234923',
          800: '#1a3a1a',
          900: '#112711',
        },
      },
    },
  },
  plugins: [],
  keyframes: {
    slideIn: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
  },
  animation: {
    slideIn: 'slideIn 0.3s ease-out',
  },
};
