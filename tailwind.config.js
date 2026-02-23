/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'merriweather': ['Courier Prime', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'mono': ['JetBrains Mono', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      colors: {
        almond: "#F2E5D7",
        chestnut: "#9B423E",
        blackbean: "#330B0B",
        night: "#151515",
      },
      transitionProperty: {
        'bg-image': 'background-image',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        blur: {
          '0%, 100%': { filter: 'blur(1px)', opacity: '0.8' },
          '50%': { filter: 'blur(1px)', opacity: '1' },
        },
        jerk: {
          '50%': { left: '1px' },
          '51%': { left: '0' },
        },
        jerkwhole: {
          '40%': { opacity: '1', top: '0', left: '0', transform: 'scale(1, 1) skew(0, 0)' },
          '41%': { opacity: '0.8', top: '0px', left: '-100px', transform: 'scale(1, 1.2) skew(50deg, 0)' },
          '42%': { opacity: '0.8', top: '0px', left: '100px', transform: 'scale(1, 1.5) skew(-60deg, 0)' },
          '43%': { opacity: '1', top: '0', left: '0', transform: 'scale(1, 1) skew(0, 0)' },
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards',
        'fadeOut': 'fadeOut 0.5s ease-in-out forwards',
        'blur': 'blur 30ms infinite',
        'jerk': 'jerk 50ms infinite',
        'jerkwhole': 'jerkwhole 5s infinite',
      },
      boxShadow: {
        'glow': '0 0px 20px rgba(255, 255, 255, 0.35), 0 0px 65px rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
}