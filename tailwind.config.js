/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ECDC4',
        secondary: '#FF6B6B',
        accent: {
          green: '#95E1D3',
          yellow: '#FCE38A',
          purple: '#DDA0DD',
          blue: '#74B9FF',
        },
        bg: {
          light: '#F0F9FF',
          gradientStart: '#E0F7FA',
          gradientEnd: '#FFF9C4',
        }
      },
      fontFamily: {
        display: ['"Comic Sans MS"', '"Microsoft YaHei"', 'cursive', 'sans-serif'],
        body: ['"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
