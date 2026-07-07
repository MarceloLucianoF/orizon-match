/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6F8F5",
          100: "#B3EBE2",
          200: "#80DDCF",
          300: "#4DD0BC",
          400: "#1AC2A9",
          500: "#00B59C",
          600: "#009E88",
          700: "#008774",
          800: "#007060",
          900: "#00594C",
        },
        accent: {
          50: "#E0F2F1",
          100: "#B2DFDB",
          200: "#80CBC4",
          300: "#4DB6AC",
          400: "#26A69A",
          500: "#00897B",
          600: "#00796B",
          700: "#00695C",
          800: "#004D40",
          900: "#00251A",
        },
        light: "#F8FAFC",
        dark: "#0D1520",
        surface: "#1A2330",
        border: "#242F3F",
      },
      backgroundImage: {
        "helix-gradient": "linear-gradient(135deg, #00897B 0%, #00B59C 100%)",
        "helix-gradient-soft":
          "linear-gradient(135deg, rgba(0, 137, 123, 0.18) 0%, rgba(0, 181, 156, 0.18) 100%)",
      },
      fontFamily: {
        sans: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        card: "0 16px 40px rgba(15, 23, 42, 0.10)",
        glow: "0 0 28px rgba(0, 181, 156, 0.30)",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        connect: {
          "0%": { transform: "translateX(-12%) scaleX(0.85)" },
          "100%": { transform: "translateX(0) scaleX(1)" },
        },
      },
      animation: {
        glow: "glowPulse 2.4s ease-in-out infinite",
        connect: "connect 1.1s ease-out",
      },
    },
  },
  plugins: [],
};
