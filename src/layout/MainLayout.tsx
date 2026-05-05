import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem("orizon-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("orizon-theme", theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-bg via-bgSoft to-bg text-text transition-colors duration-300">
        <Navbar
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
          onLogout={() => navigate("/")}
          user={{ displayName: "Maria Investidora", role: "user" }}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:py-10">
          <Outlet />
        </main>

        <Footer />

        {/* User & Theme Widget no Canto (Evita quebra no header) */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-border bg-surface/80 p-2 shadow-card backdrop-blur-xl">
          <span className="pl-3 pr-1 text-sm font-semibold text-text">
            Maria Investidora
          </span>
          <div className="h-4 w-px bg-border"></div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface2 hover:text-text"
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="hidden md:inline">{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}