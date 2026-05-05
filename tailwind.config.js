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
        "orizon-gradient": "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
        "orizon-gradient-soft": "linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(34, 211, 238, 0.14) 100%)",
      },
      boxShadow: {
        card: "0 16px 40px rgba(15, 23, 42, 0.1)",
        glow: "0 0 30px rgba(99, 102, 241, 0.22)",
      },
    },
  },
  plugins: [],
};
