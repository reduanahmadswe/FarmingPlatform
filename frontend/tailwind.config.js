/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      colors: {
        brand: {
          dark: '#1A4D2E',
          light: '#4F772D',
          accent: '#F9C74F',
          bg: '#F3F8F2'
        }
      }
    },
  },
  plugins: [],
}
