/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#121212',
        },
        accent: {
          50: '#fff9e6',
          100: '#feefc3',
          200: '#fce49f',
          300: '#fad87b',
          400: '#f8ce57',
          500: '#f6c244',
          600: '#f5b724',
          700: '#e1a30e',
          800: '#bd880c',
          900: '#9a6e0a',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      transitionDuration: {
        '2000': '2000ms',
      }
    },
  },
  plugins: [
     require('@tailwindcss/forms'), require('@tailwindcss/typography')
  ],
}