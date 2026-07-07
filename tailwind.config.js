/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        bgSoft: "rgb(var(--color-bg-soft) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surface2: "rgb(var(--color-surface-2) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Sora", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "helix-gradient": "linear-gradient(135deg, #00897B 0%, #00B59C 100%)",
        "helix-gradient-soft": "linear-gradient(135deg, rgba(0, 137, 123, 0.18) 0%, rgba(0, 181, 156, 0.14) 100%)",
      },
      boxShadow: {
        card: "0 16px 40px rgba(15, 23, 42, 0.1)",
        glow: "0 0 30px rgba(0, 181, 156, 0.22)",
      },
    },
  },
  plugins: [],
};
