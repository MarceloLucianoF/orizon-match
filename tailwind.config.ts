/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
          800: "#312E81",
          900: "#1E1B4B",
        },
        accent: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        light: "#F8FAFC",
        dark: "#0F172A",
        surface: "#111827",
        border: "#1F2937",
      },
      backgroundImage: {
        "orizon-gradient": "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
        "orizon-gradient-soft":
          "linear-gradient(135deg, rgba(79, 70, 229, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)",
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
        glow: "0 0 28px rgba(79, 70, 229, 0.30)",
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
