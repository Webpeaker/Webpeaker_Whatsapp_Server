/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080b12',
        panel: '#111827',
        panelSoft: '#172033',
        line: '#273247',
        brand: '#18c29c'
      },
      boxShadow: {
        glow: '0 20px 80px rgba(24, 194, 156, 0.14)'
      }
    },
  },
  plugins: [],
};
