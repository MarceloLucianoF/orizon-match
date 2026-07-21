import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Menu, LogOut, Globe, Check } from "lucide-react";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLanguage = i18n.language || "pt";

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    setLangDropdownOpen(false);
  };

  const languages = [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" }
  ];

  return (
    <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Spacer for desktop (left side empty) */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-4 md:gap-6">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-all font-medium text-sm bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 px-2.5 py-1.5 rounded-xl cursor-pointer"
            title="Alterar idioma / Change language"
          >
            <Globe size={16} />
            <span className="uppercase text-xs font-bold">{currentLanguage}</span>
          </button>

          {langDropdownOpen && (
            <>
              {/* Invisible backdrop to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setLangDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-36 bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl rounded-xl p-1.5 z-20 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all ${
                      currentLanguage === lang.code
                        ? "bg-teal-600/10 text-teal-400"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLanguage === lang.code && <Check size={14} className="text-teal-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-200 truncate max-w-[160px]">
              {user?.email?.split('@')[0] || t("topbar.userDefault")}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[160px]">{user?.email}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold uppercase overflow-hidden text-sm">
            {user?.email ? user.email.charAt(0) : "U"}
          </div>
        </div>
        
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
        
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-medium text-sm"
          title={t("sidebar.logout")}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">{t("sidebar.logout")}</span>
        </button>
      </div>
    </header>
  );
}
