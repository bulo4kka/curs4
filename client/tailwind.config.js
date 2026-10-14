/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0B',
        card: '#1C1C1E',
        led: '#FF0000',
        led2: '#D71921',
      },
      fontFamily: {
        dot: ['Silkscreen', 'Unbounded', 'monospace'],
        ndot: ['Silkscreen', 'monospace'],
        display: ['Unbounded', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
