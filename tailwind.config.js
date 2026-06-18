/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#5EF58E',
          400: '#00D84A',
          500: '#00D84A',
          600: '#00B83E',
          700: '#008F31',
        },
        canvas: '#020817',
        surface: '#111827',
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
