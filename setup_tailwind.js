// setup_tailwind.js

const fs = require('fs');
const path = require('path');

const tailwindConfigContent = `
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
      // Configuration for the scrolling banner animation
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        // Adjust '30s' for desired speed
        scroll: 'scroll 30s linear infinite', 
      }
    },
  },
  plugins: [],
}
`;

const postcssConfigContent = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

try {
    const tailwindPath = path.join(process.cwd(), 'tailwind.config.js');
    const postcssPath = path.join(process.cwd(), 'postcss.config.js');

    // Write the Tailwind Config
    fs.writeFileSync(tailwindPath, tailwindConfigContent.trim(), 'utf8');
    console.log(`✅ Created ${path.basename(tailwindPath)}`);

    // Write the PostCSS Config
    fs.writeFileSync(postcssPath, postcssConfigContent.trim(), 'utf8');
    console.log(`✅ Created ${path.basename(postcssPath)}`);

    console.log("Configuration files successfully created!");

} catch (error) {
    console.error("❌ Error creating files:", error);
}