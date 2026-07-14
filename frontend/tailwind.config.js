/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#b7d3ff',
          300: '#84b4ff',
          400: '#4c8bff',
          500: '#1e66f5',
          600: '#134fd6',
          700: '#103fac',
          800: '#12368a',
          900: '#14306e',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
