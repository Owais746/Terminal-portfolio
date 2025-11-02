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
          bg: '#000000',
          text: '#00ff99',
          cyan: '#00ffff',
          yellow: '#ffff00',
          red: '#ff0000',
          blue: '#0099ff',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
