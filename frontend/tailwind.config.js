/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060a17',
          900: '#0b132b',
          850: '#131d38',
          800: '#1c2541',
          700: '#273459',
          600: '#3a506b',
        },
        accent: {
          blue: '#00b4d8',
          cyan: '#48cae4',
          teal: '#06d6a0',
          amber: '#ffd166',
          orange: '#f77f00',
          red: '#ef476f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
