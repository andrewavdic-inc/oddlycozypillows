/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', '"Nunito"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Nunito"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4.5s ease-in-out 1.5s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};
