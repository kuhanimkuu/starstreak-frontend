/** @type {import('tailwindcss').Config} */
// Starstreak "Night sky" design system — dark-first, matching the app:
// night navy surfaces, star-white text, flare orange / amber / gold accents.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Night sky surfaces (darkest → lightest)
        night: {
          950: "#05060F",
          900: "#0A0B1E", // page background (app backgroundDark)
          850: "#0E1026",
          800: "#13152F", // cards
          700: "#1A1D3D", // raised / hover
          600: "#252852", // borders on raised
          500: "#343868",
        },
        line: "#22254A", // hairlines on night
        // Star-white text scale
        star: "#F2F3FF", // primary text
        mist: "#AEB2D1", // secondary text (AA on night-900)
        dust: "#7E82A6", // tertiary / meta

        // Flare accents (tuned for dark backgrounds)
        flare: {
          DEFAULT: "#FF6D1F",
          deep: "#E8590C",
          soft: "#FF8A3D",
        },
        amber: { DEFAULT: "#FFAB3D", 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" },
        gold: "#FFD166",

        // Legacy token names used across the codebase, retuned for night
        brand: "#FF7A2E",
        brandLight: "#FFAB3D",
        brandDark: "#E8590C",
        accent: "#FFAB3D",
        accentLight: "#FFD166",
        brandIndigo: "#1A1B35",
        backgroundDark: "#0A0B1E",
        surfaceDark: "#13152F",
        surfaceLight: "#13152F",
        textLight: "#F2F3FF",
        textDark: "#F2F3FF",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        flare: "0 10px 40px -10px rgba(255, 109, 31, 0.55)",
        "flare-lg": "0 20px 70px -15px rgba(255, 109, 31, 0.6)",
        night: "0 20px 60px -20px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "flare-gradient": "linear-gradient(135deg, #FF6D1F 0%, #FFAB3D 60%, #FFD166 100%)",
        "night-gradient": "radial-gradient(ellipse at top, #1A1D3D 0%, #0A0B1E 55%)",
      },
      keyframes: {
        twinkle: { "0%,100%": { opacity: "0.25" }, "50%": { opacity: "1" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "shooting-star": {
          "0%": { transform: "translate3d(0,0,0) rotate(-24deg)", opacity: "0" },
          "8%": { opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "translate3d(-60vw,30vw,0) rotate(-24deg)", opacity: "0" },
        },
        "glow-pulse": { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "shooting-star": "shooting-star 2.6s ease-in forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
