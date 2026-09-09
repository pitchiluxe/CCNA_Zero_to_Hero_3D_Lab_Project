/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cisco: { 500: '#0ac2ff', 600: '#049fd9', 700: '#037bb6' },
        net: { 900: '#0b1221', 800: '#111c2f', 700: '#1a2744' }
      }
    },
  },
  plugins: [],
};
