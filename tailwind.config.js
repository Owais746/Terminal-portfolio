/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'var(--color-bg)',
          text: 'var(--color-text)',
          cyan: 'var(--color-cyan)',
          yellow: 'var(--color-yellow)',
          red: 'var(--color-red)',
          blue: 'var(--color-blue)',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
