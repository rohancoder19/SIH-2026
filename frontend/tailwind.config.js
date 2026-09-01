/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F1F5F9',
        surface: '#F8FAFC',
        subtle: '#E2E8F0',
        border: '#CBD5E1',
        'text-main': '#0F172A',
        'text-sub': '#334155',
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
        },
        navy: {
          950: '#F1F5F9',
          900: '#F8FAFC',
          850: '#F8FAFC',
          800: '#E2E8F0',
          700: '#CBD5E1',
          600: '#94A3B8',
        },
        accent: {
          blue: '#4F46E5',
          cyan: '#6366F1',
          teal: '#059669',
          amber: '#D97706',
          orange: '#EA580C',
          red: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
