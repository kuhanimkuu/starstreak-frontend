/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors that work in both themes
        brand: {
          emerald: {
            light: '#10b981',
            DEFAULT: '#059669',
            dark: '#047857',
          },
          teal: {
            light: '#14b8a6',
            DEFAULT: '#0d9488',
            dark: '#0f766e',
          },
          cyan: {
            light: '#06b6d4',
            DEFAULT: '#0891b2',
            dark: '#0e7490',
          },
        },
      },
      backgroundImage: {
        'linear-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'linear-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'linear-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
