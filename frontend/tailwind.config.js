/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E2145',
          dark: '#2D2B57',
          bg: '#E9EDF2',
        }
      }
    },
  },
  plugins: [],
}