/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Ensure these paths point to your theme files (e.g., .liquid, .js)
    './**/*.liquid', 
    './**/*.html', 
    './assets/*.js'
  ],
  theme: {
    extend: {
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          // CHANGE 1: Use -150% to ensure enough scroll distance
          '100%': { transform: 'translateX(-150%)' }, 
        }
      },
      animation: {
        // CHANGE 2: Increase duration to compensate for longer scroll
        scroll: 'scroll 40s linear infinite', 
      }
    },
  },
  plugins: [],
}